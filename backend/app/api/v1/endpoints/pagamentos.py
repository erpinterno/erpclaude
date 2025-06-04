from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Pagamento])
def read_pagamentos(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar pagamentos.
    """
    pagamentos = crud.crud_pagamento.get_multi(db, skip=skip, limit=limit)
    return pagamentos

@router.get("/conta-pagar/{conta_pagar_id}", response_model=List[schemas.Pagamento])
def read_pagamentos_by_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    conta_pagar_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar pagamentos de uma conta a pagar específica.
    """
    pagamentos = crud.crud_pagamento.get_by_conta_pagar(db, conta_pagar_id=conta_pagar_id)
    return pagamentos

@router.post("/", response_model=schemas.Pagamento)
def create_pagamento(
    *,
    db: Session = Depends(deps.get_db),
    pagamento_in: schemas.PagamentoCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Criar novo pagamento.
    """
    # Verificar se a conta a pagar existe
    conta_pagar = crud.crud_conta_pagar.get(db=db, id=pagamento_in.conta_pagar_id)
    if not conta_pagar:
        raise HTTPException(status_code=404, detail="Conta a pagar não encontrada")
    
    # Verificar se a conta corrente existe (se informada)
    if pagamento_in.conta_corrente_id:
        conta_corrente = crud.crud_conta_corrente.get(db=db, id=pagamento_in.conta_corrente_id)
        if not conta_corrente:
            raise HTTPException(status_code=404, detail="Conta corrente não encontrada")
    
    # Criar o pagamento
    pagamento = crud.crud_pagamento.create_with_user(
        db=db, obj_in=pagamento_in, user_id=current_user.id
    )
    
    # Atualizar o valor pago na conta a pagar
    total_pagamentos = sum([p.valor for p in crud.crud_pagamento.get_by_conta_pagar(db, conta_pagar_id=conta_pagar.id)])
    
    # Atualizar status da conta se totalmente paga
    if total_pagamentos >= conta_pagar.valor_original:
        conta_pagar_update = schemas.ContaPagarUpdate(
            valor_pago=total_pagamentos,
            status=schemas.StatusConta.PAGO
        )
    else:
        conta_pagar_update = schemas.ContaPagarUpdate(
            valor_pago=total_pagamentos
        )
    
    crud.crud_conta_pagar.update(db=db, db_obj=conta_pagar, obj_in=conta_pagar_update)
    
    return pagamento

@router.put("/{id}", response_model=schemas.Pagamento)
def update_pagamento(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    pagamento_in: schemas.PagamentoUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Atualizar pagamento.
    """
    pagamento = crud.crud_pagamento.get(db=db, id=id)
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    
    # Verificar se a conta corrente existe (se informada)
    if pagamento_in.conta_corrente_id:
        conta_corrente = crud.crud_conta_corrente.get(db=db, id=pagamento_in.conta_corrente_id)
        if not conta_corrente:
            raise HTTPException(status_code=404, detail="Conta corrente não encontrada")
    
    pagamento = crud.crud_pagamento.update(
        db=db, db_obj=pagamento, obj_in=pagamento_in
    )
    
    # Recalcular o valor pago na conta a pagar
    conta_pagar = crud.crud_conta_pagar.get(db=db, id=pagamento.conta_pagar_id)
    total_pagamentos = sum([p.valor for p in crud.crud_pagamento.get_by_conta_pagar(db, conta_pagar_id=conta_pagar.id)])
    
    # Atualizar status da conta se totalmente paga
    if total_pagamentos >= conta_pagar.valor_original:
        conta_pagar_update = schemas.ContaPagarUpdate(
            valor_pago=total_pagamentos,
            status=schemas.StatusConta.PAGO
        )
    else:
        conta_pagar_update = schemas.ContaPagarUpdate(
            valor_pago=total_pagamentos,
            status=schemas.StatusConta.PENDENTE
        )
    
    crud.crud_conta_pagar.update(db=db, db_obj=conta_pagar, obj_in=conta_pagar_update)
    
    return pagamento

@router.get("/{id}", response_model=schemas.Pagamento)
def read_pagamento(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter pagamento por ID.
    """
    pagamento = crud.crud_pagamento.get(db=db, id=id)
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    return pagamento

@router.delete("/{id}", response_model=schemas.Pagamento)
def delete_pagamento(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Deletar pagamento.
    """
    pagamento = crud.crud_pagamento.get(db=db, id=id)
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    
    conta_pagar_id = pagamento.conta_pagar_id
    
    # Deletar o pagamento
    pagamento = crud.crud_pagamento.remove(db=db, id=id)
    
    # Recalcular o valor pago na conta a pagar
    conta_pagar = crud.crud_conta_pagar.get(db=db, id=conta_pagar_id)
    total_pagamentos = sum([p.valor for p in crud.crud_pagamento.get_by_conta_pagar(db, conta_pagar_id=conta_pagar_id)])
    
    # Atualizar status da conta
    if total_pagamentos >= conta_pagar.valor_original:
        status = schemas.StatusConta.PAGO
    elif total_pagamentos > 0:
        status = schemas.StatusConta.PENDENTE
    else:
        status = schemas.StatusConta.PENDENTE
    
    conta_pagar_update = schemas.ContaPagarUpdate(
        valor_pago=total_pagamentos,
        status=status
    )
    
    crud.crud_conta_pagar.update(db=db, db_obj=conta_pagar, obj_in=conta_pagar_update)
    
    return pagamento
