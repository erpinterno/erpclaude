from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.financeiro import (
    ContaPagar, ContaReceber, ContaCorrente, Categoria, 
    ClienteFornecedor, ContatoClienteFornecedor, AnexoClienteFornecedor, Pagamento
)
from app.schemas.financeiro import (
    ContaPagarCreate, ContaPagarUpdate,
    ContaReceberCreate, ContaReceberUpdate,
    ContaCorrenteCreate, ContaCorrenteUpdate,
    CategoriaCreate, CategoriaUpdate,
    ClienteFornecedorCreate, ClienteFornecedorUpdate,
    ContatoClienteFornecedorCreate,
    AnexoClienteFornecedorCreate,
    PagamentoCreate, PagamentoUpdate
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
    def get_ativas(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ContaCorrente]:
        return (
            db.query(ContaCorrente)
            .filter(ContaCorrente.ativa == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

class CRUDCategoria(CRUDBase[Categoria, CategoriaCreate, CategoriaUpdate]):
    def get_ativas(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Categoria]:
        return (
            db.query(Categoria)
            .filter(Categoria.ativa == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

class CRUDClienteFornecedor(CRUDBase[ClienteFornecedor, ClienteFornecedorCreate, ClienteFornecedorUpdate]):
    def get_clientes(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ClienteFornecedor]:
        return (
            db.query(ClienteFornecedor)
            .filter(ClienteFornecedor.eh_cliente == True)
            .filter(ClienteFornecedor.ativo == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_fornecedores(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ClienteFornecedor]:
        return (
            db.query(ClienteFornecedor)
            .filter(ClienteFornecedor.eh_fornecedor == True)
            .filter(ClienteFornecedor.ativo == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_cpf_cnpj(self, db: Session, *, cpf_cnpj: str) -> Optional[ClienteFornecedor]:
        return db.query(ClienteFornecedor).filter(ClienteFornecedor.cpf_cnpj == cpf_cnpj).first()

class CRUDContatoClienteFornecedor(CRUDBase[ContatoClienteFornecedor, ContatoClienteFornecedorCreate, None]):
    def get_by_cliente_fornecedor(
        self, db: Session, *, cliente_fornecedor_id: int
    ) -> List[ContatoClienteFornecedor]:
        return (
            db.query(ContatoClienteFornecedor)
            .filter(ContatoClienteFornecedor.cliente_fornecedor_id == cliente_fornecedor_id)
            .all()
        )

class CRUDAnexoClienteFornecedor(CRUDBase[AnexoClienteFornecedor, AnexoClienteFornecedorCreate, None]):
    def get_by_cliente_fornecedor(
        self, db: Session, *, cliente_fornecedor_id: int
    ) -> List[AnexoClienteFornecedor]:
        return (
            db.query(AnexoClienteFornecedor)
            .filter(AnexoClienteFornecedor.cliente_fornecedor_id == cliente_fornecedor_id)
            .all()
        )

class CRUDPagamento(CRUDBase[Pagamento, PagamentoCreate, PagamentoUpdate]):
    def get_by_conta_pagar(
        self, db: Session, *, conta_pagar_id: int
    ) -> List[Pagamento]:
        return (
            db.query(Pagamento)
            .filter(Pagamento.conta_pagar_id == conta_pagar_id)
            .all()
        )
    
    def create_with_user(
        self, db: Session, *, obj_in: PagamentoCreate, user_id: int
    ) -> Pagamento:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# Instâncias dos CRUDs
crud_conta_pagar = CRUDContaPagar(ContaPagar)
crud_conta_receber = CRUDContaReceber(ContaReceber)
crud_conta_corrente = CRUDContaCorrente(ContaCorrente)
crud_categoria = CRUDCategoria(Categoria)
crud_cliente_fornecedor = CRUDClienteFornecedor(ClienteFornecedor)
crud_contato_cliente_fornecedor = CRUDContatoClienteFornecedor(ContatoClienteFornecedor)
crud_anexo_cliente_fornecedor = CRUDAnexoClienteFornecedor(AnexoClienteFornecedor)
crud_pagamento = CRUDPagamento(Pagamento)
