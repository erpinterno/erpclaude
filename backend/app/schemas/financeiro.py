from typing import Optional
from datetime import date
from pydantic import BaseModel
from enum import Enum

class StatusConta(str, Enum):
    PENDENTE = "pendente"
    PAGO = "pago"
    CANCELADO = "cancelado"
    VENCIDO = "vencido"

# Contas a Pagar
class ContaPagarBase(BaseModel):
    descricao: str
    fornecedor: str
    valor: float
    data_vencimento: date
    data_pagamento: Optional[date] = None
    status: StatusConta = StatusConta.PENDENTE
    observacoes: Optional[str] = None

class ContaPagarCreate(ContaPagarBase):
    pass

class ContaPagarUpdate(BaseModel):
    descricao: Optional[str] = None
    fornecedor: Optional[str] = None
    valor: Optional[float] = None
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    status: Optional[StatusConta] = None
    observacoes: Optional[str] = None

class ContaPagar(ContaPagarBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Contas a Receber
class ContaReceberBase(BaseModel):
    descricao: str
    cliente: str
    valor: float
    data_vencimento: date
    data_recebimento: Optional[date] = None
    status: StatusConta = StatusConta.PENDENTE
    observacoes: Optional[str] = None

class ContaReceberCreate(ContaReceberBase):
    pass

class ContaReceberUpdate(BaseModel):
    descricao: Optional[str] = None
    cliente: Optional[str] = None
    valor: Optional[float] = None
    data_vencimento: Optional[date] = None
    data_recebimento: Optional[date] = None
    status: Optional[StatusConta] = None
    observacoes: Optional[str] = None

class ContaReceber(ContaReceberBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Conta Corrente
class ContaCorrenteBase(BaseModel):
    banco: str
    agencia: str
    conta: str
    tipo_conta: Optional[str] = None
    saldo_inicial: float = 0.0
    saldo_atual: float = 0.0
    ativa: bool = True

class ContaCorrenteCreate(ContaCorrenteBase):
    pass

class ContaCorrenteUpdate(BaseModel):
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    saldo_inicial: Optional[float] = None
    saldo_atual: Optional[float] = None
    ativa: Optional[bool] = None

class ContaCorrente(ContaCorrenteBase):
    id: int

    class Config:
        from_attributes = True