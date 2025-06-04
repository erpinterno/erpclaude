from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.ContaPagar])
def read_contas_pagar(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar contas a pagar do usuário.
    """
    contas = crud.crud_conta_pagar.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return contas

@router.post("/", response_model=schemas.ContaPagar)
def create_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    conta_in: schemas.ContaPagarCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Criar nova conta a pagar.
    """
    # Verificar se o fornecedor existe (se informado)
    if conta_in.fornecedor_id:
        fornecedor = crud.crud_cliente_fornecedor.get(db=db, id=conta_in.fornecedor_id)
        if not fornecedor:
            raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
        if not fornecedor.eh_fornecedor:
            raise HTTPException(status_code=400, detail="Cliente/Fornecedor selecionado não é um fornecedor")
    
    # Verificar se a categoria existe (se informada)
    if conta_in.categoria_id:
        categoria = crud.crud_categoria.get(db=db, id=conta_in.categoria_id)
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    # Verificar se a conta corrente existe (se informada)
    if conta_in.conta_corrente_id:
        conta_corrente = crud.crud_conta_corrente.get(db=db, id=conta_in.conta_corrente_id)
        if not conta_corrente:
            raise HTTPException(status_code=404, detail="Conta corrente não encontrada")
    
    conta = crud.crud_conta_pagar.create_with_user(
        db=db, obj_in=conta_in, user_id=current_user.id
    )
    return conta

@router.put("/{id}", response_model=schemas.ContaPagar)
def update_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    conta_in: schemas.ContaPagarUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Atualizar conta a pagar.
    """
    conta = crud.crud_conta_pagar.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if conta.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    # Verificar se o fornecedor existe (se informado)
    if conta_in.fornecedor_id:
        fornecedor = crud.crud_cliente_fornecedor.get(db=db, id=conta_in.fornecedor_id)
        if not fornecedor:
            raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
        if not fornecedor.eh_fornecedor:
            raise HTTPException(status_code=400, detail="Cliente/Fornecedor selecionado não é um fornecedor")
    
    # Verificar se a categoria existe (se informada)
    if conta_in.categoria_id:
        categoria = crud.crud_categoria.get(db=db, id=conta_in.categoria_id)
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    # Verificar se a conta corrente existe (se informada)
    if conta_in.conta_corrente_id:
        conta_corrente = crud.crud_conta_corrente.get(db=db, id=conta_in.conta_corrente_id)
        if not conta_corrente:
            raise HTTPException(status_code=404, detail="Conta corrente não encontrada")
    
    conta = crud.crud_conta_pagar.update(db=db, db_obj=conta, obj_in=conta_in)
    return conta

@router.get("/{id}", response_model=schemas.ContaPagar)
def read_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter conta a pagar por ID.
    """
    conta = crud.crud_conta_pagar.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if conta.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return conta

@router.delete("/{id}")
def delete_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Deletar conta a pagar.
    """
    conta = crud.crud_conta_pagar.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if conta.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    # Verificar se existem pagamentos associados
    pagamentos = crud.crud_pagamento.get_by_conta_pagar(db=db, conta_pagar_id=id)
    if pagamentos:
        raise HTTPException(
            status_code=400, 
            detail="Não é possível deletar conta a pagar que possui pagamentos associados"
        )
    
    conta = crud.crud_conta_pagar.remove(db=db, id=id)
    return {"ok": True}

# Endpoint para obter pagamentos de uma conta a pagar
@router.get("/{id}/pagamentos", response_model=List[schemas.Pagamento])
def read_pagamentos_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter pagamentos de uma conta a pagar.
    """
    conta = crud.crud_conta_pagar.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if conta.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    pagamentos = crud.crud_pagamento.get_by_conta_pagar(db=db, conta_pagar_id=id)
    return pagamentos
