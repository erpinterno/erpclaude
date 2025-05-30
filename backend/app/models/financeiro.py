from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class StatusConta(enum.Enum):
    PENDENTE = "pendente"
    PAGO = "pago"
    CANCELADO = "cancelado"
    VENCIDO = "vencido"

class ContaPagar(Base):
    __tablename__ = "contas_pagar"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False)
    fornecedor = Column(String, nullable=False)
    valor = Column(Float, nullable=False)
    data_vencimento = Column(Date, nullable=False)
    data_pagamento = Column(Date)
    status = Column(Enum(StatusConta), default=StatusConta.PENDENTE)
    observacoes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", backref="contas_pagar")

class ContaReceber(Base):
    __tablename__ = "contas_receber"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False)
    cliente = Column(String, nullable=False)
    valor = Column(Float, nullable=False)
    data_vencimento = Column(Date, nullable=False)
    data_recebimento = Column(Date)
    status = Column(Enum(StatusConta), default=StatusConta.PENDENTE)
    observacoes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", backref="contas_receber")

class ContaCorrente(Base):
    __tablename__ = "contas_corrente"

    id = Column(Integer, primary_key=True, index=True)
    banco = Column(String, nullable=False)
    agencia = Column(String, nullable=False)
    conta = Column(String, nullable=False)
    tipo_conta = Column(String)
    saldo_inicial = Column(Float, default=0.0)
    saldo_atual = Column(Float, default=0.0)
    ativa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())