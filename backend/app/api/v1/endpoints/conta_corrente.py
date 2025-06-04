from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.ContaCorrente])
def read_contas_corrente(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar contas corrente.
    """
    contas = crud.crud_conta_corrente.get_multi(db, skip=skip, limit=limit)
    return contas

@router.get("/ativas", response_model=List[schemas.ContaCorrente])
def read_contas_corrente_ativas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar apenas contas corrente ativas.
    """
    contas = crud.crud_conta_corrente.get_ativas(db, skip=skip, limit=limit)
    return contas

@router.post("/", response_model=schemas.ContaCorrente)
def create_conta_corrente(
    *,
    db: Session = Depends(deps.get_db),
    conta_in: schemas.ContaCorrenteCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Criar nova conta corrente.
    """
    conta = crud.crud_conta_corrente.create(db=db, obj_in=conta_in)
    return conta

@router.put("/{id}", response_model=schemas.ContaCorrente)
def update_conta_corrente(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    conta_in: schemas.ContaCorrenteUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Atualizar conta corrente.
    """
    conta = crud.crud_conta_corrente.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta corrente não encontrada")
    
    conta = crud.crud_conta_corrente.update(
        db=db, db_obj=conta, obj_in=conta_in
    )
    return conta

@router.get("/{id}", response_model=schemas.ContaCorrente)
def read_conta_corrente(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter conta corrente por ID.
    """
    conta = crud.crud_conta_corrente.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta corrente não encontrada")
    return conta

@router.delete("/{id}", response_model=schemas.ContaCorrente)
def delete_conta_corrente(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Deletar conta corrente.
    """
    conta = crud.crud_conta_corrente.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta corrente não encontrada")
    
    conta = crud.crud_conta_corrente.remove(db=db, id=id)
    return conta
