from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_conta_pagar
from app.models import User
from app.schemas import ContaPagar, ContaPagarCreate, ContaPagarUpdate

router = APIRouter()

@router.get("/", response_model=List[ContaPagar])
def read_contas_pagar(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    contas = crud_conta_pagar.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return contas

@router.post("/", response_model=ContaPagar)
def create_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    conta_in: ContaPagarCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    conta = crud_conta_pagar.create_with_user(
        db=db, obj_in=conta_in, user_id=current_user.id
    )
    return conta

@router.put("/{id}", response_model=ContaPagar)
def update_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    conta_in: ContaPagarUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    conta = crud_conta_pagar.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if conta.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Sem permissão")
    conta = crud_conta_pagar.update(db=db, db_obj=conta, obj_in=conta_in)
    return conta

@router.delete("/{id}")
def delete_conta_pagar(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    conta = crud_conta_pagar.get(db=db, id=id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if conta.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Sem permissão")
    conta = crud_conta_pagar.remove(db=db, id=id)
    return {"ok": True}