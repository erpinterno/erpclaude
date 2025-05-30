from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.financeiro import ContaPagar, ContaReceber, ContaCorrente
from app.schemas.financeiro import (
    ContaPagarCreate, ContaPagarUpdate,
    ContaReceberCreate, ContaReceberUpdate,
    ContaCorrenteCreate, ContaCorrenteUpdate
)

class CRUDContaPagar(CRUDBase[ContaPagar, ContaPagarCreate, ContaPagarUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[ContaPagar]:
        return (
            db.query(ContaPagar)
            .filter(ContaPagar.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_user(
        self, db: Session, *, obj_in: ContaPagarCreate, user_id: int
    ) -> ContaPagar:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDContaReceber(CRUDBase[ContaReceber, ContaReceberCreate, ContaReceberUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[ContaReceber]:
        return (
            db.query(ContaReceber)
            .filter(ContaReceber.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_user(
        self, db: Session, *, obj_in: ContaReceberCreate, user_id: int
    ) -> ContaReceber:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDContaCorrente(CRUDBase[ContaCorrente, ContaCorrenteCreate, ContaCorrenteUpdate]):
    pass

crud_conta_pagar = CRUDContaPagar(ContaPagar)
crud_conta_receber = CRUDContaReceber(ContaReceber)
crud_conta_corrente = CRUDContaCorrente(ContaCorrente)