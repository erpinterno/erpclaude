from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel
from enum import Enum
from decimal import Decimal

class StatusConta(str, Enum):
    PENDENTE = "pendente"
    PAGO = "pago"
    CANCELADO = "cancelado"
    VENCIDO = "vencido"

class TipoPessoa(str, Enum):
    FISICA = "fisica"
    JURIDICA = "juridica"

class TipoPagamento(str, Enum):
    DINHEIRO = "dinheiro"
    CARTAO_CREDITO = "cartao_credito"
    CARTAO_DEBITO = "cartao_debito"
    TRANSFERENCIA = "transferencia"
    BOLETO = "boleto"
    PIX = "pix"
    CHEQUE = "cheque"

# Categorias
class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativa: bool = True

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    ativa: Optional[bool] = None

class Categoria(CategoriaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Contatos Cliente/Fornecedor
class ContatoClienteFornecedorBase(BaseModel):
    tipo: str
    valor: str
    descricao: Optional[str] = None
    principal: bool = False

class ContatoClienteFornecedorCreate(ContatoClienteFornecedorBase):
    cliente_fornecedor_id: int

class ContatoClienteFornecedor(ContatoClienteFornecedorBase):
    id: int
    cliente_fornecedor_id: int

    class Config:
        from_attributes = True

# Anexos Cliente/Fornecedor
class AnexoClienteFornecedorBase(BaseModel):
    nome_arquivo: str
    caminho_arquivo: str
    tipo_arquivo: Optional[str] = None
    tamanho: Optional[int] = None
    descricao: Optional[str] = None

class AnexoClienteFornecedorCreate(AnexoClienteFornecedorBase):
    cliente_fornecedor_id: int

class AnexoClienteFornecedor(AnexoClienteFornecedorBase):
    id: int
    cliente_fornecedor_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Clientes e Fornecedores
class ClienteFornecedorBase(BaseModel):
    nome: str
    nome_fantasia: Optional[str] = None
    tipo_pessoa: TipoPessoa
    cpf_cnpj: str
    rg_ie: Optional[str] = None
    im: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    telefone1: Optional[str] = None
    telefone2: Optional[str] = None
    email: Optional[str] = None
    site: Optional[str] = None
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    pix: Optional[str] = None
    cnae_principal: Optional[str] = None
    cnae_secundario: Optional[str] = None
    inscricao_suframa: Optional[str] = None
    eh_cliente: bool = False
    eh_fornecedor: bool = False
    ativo: bool = True
    observacoes: Optional[str] = None

class ClienteFornecedorCreate(ClienteFornecedorBase):
    pass

class ClienteFornecedorUpdate(BaseModel):
    nome: Optional[str] = None
    nome_fantasia: Optional[str] = None
    tipo_pessoa: Optional[TipoPessoa] = None
    cpf_cnpj: Optional[str] = None
    rg_ie: Optional[str] = None
    im: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    telefone1: Optional[str] = None
    telefone2: Optional[str] = None
    email: Optional[str] = None
    site: Optional[str] = None
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    pix: Optional[str] = None
    cnae_principal: Optional[str] = None
    cnae_secundario: Optional[str] = None
    inscricao_suframa: Optional[str] = None
    eh_cliente: Optional[bool] = None
    eh_fornecedor: Optional[bool] = None
    ativo: Optional[bool] = None
    observacoes: Optional[str] = None

class ClienteFornecedor(ClienteFornecedorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    contatos: List[ContatoClienteFornecedor] = []
    anexos: List[AnexoClienteFornecedor] = []

    class Config:
        from_attributes = True

# Pagamentos
class PagamentoBase(BaseModel):
    valor: Decimal
    data_pagamento: date
    tipo_pagamento: TipoPagamento
    numero_documento: Optional[str] = None
    observacoes: Optional[str] = None

class PagamentoCreate(PagamentoBase):
    conta_pagar_id: int
    conta_corrente_id: Optional[int] = None

class PagamentoUpdate(BaseModel):
    valor: Optional[Decimal] = None
    data_pagamento: Optional[date] = None
    tipo_pagamento: Optional[TipoPagamento] = None
    numero_documento: Optional[str] = None
    observacoes: Optional[str] = None
    conta_corrente_id: Optional[int] = None

class Pagamento(PagamentoBase):
    id: int
    conta_pagar_id: int
    conta_corrente_id: Optional[int] = None
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Contas a Pagar
class ContaPagarBase(BaseModel):
    descricao: str
    valor_original: Decimal
    data_vencimento: date
    data_emissao: Optional[date] = None
    numero_documento: Optional[str] = None
    status: StatusConta = StatusConta.PENDENTE
    observacoes: Optional[str] = None

class ContaPagarCreate(ContaPagarBase):
    fornecedor_id: Optional[int] = None
    categoria_id: Optional[int] = None
    conta_corrente_id: Optional[int] = None

class ContaPagarUpdate(BaseModel):
    descricao: Optional[str] = None
    fornecedor_id: Optional[int] = None
    categoria_id: Optional[int] = None
    conta_corrente_id: Optional[int] = None
    valor_original: Optional[Decimal] = None
    data_vencimento: Optional[date] = None
    data_emissao: Optional[date] = None
    numero_documento: Optional[str] = None
    status: Optional[StatusConta] = None
    observacoes: Optional[str] = None

class ContaPagar(ContaPagarBase):
    id: int
    fornecedor_id: Optional[int] = None
    categoria_id: Optional[int] = None
    conta_corrente_id: Optional[int] = None
    valor_pago: Decimal
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    pagamentos: List[Pagamento] = []

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
    nome: str
    banco: str
    codigo_banco: Optional[str] = None
    agencia: str
    conta: str
    digito_conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    saldo_inicial: Decimal = 0.0
    saldo_atual: Decimal = 0.0
    limite: Decimal = 0.0
    gerente: Optional[str] = None
    telefone_banco: Optional[str] = None
    observacoes: Optional[str] = None
    ativa: bool = True

class ContaCorrenteCreate(ContaCorrenteBase):
    pass

class ContaCorrenteUpdate(BaseModel):
    nome: Optional[str] = None
    banco: Optional[str] = None
    codigo_banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    digito_conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    saldo_inicial: Optional[Decimal] = None
    saldo_atual: Optional[Decimal] = None
    limite: Optional[Decimal] = None
    gerente: Optional[str] = None
    telefone_banco: Optional[str] = None
    observacoes: Optional[str] = None
    ativa: Optional[bool] = None

class ContaCorrente(ContaCorrenteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
