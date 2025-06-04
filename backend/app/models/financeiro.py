from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey, DateTime, Enum, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class StatusConta(enum.Enum):
    PENDENTE = "pendente"
    PAGO = "pago"
    CANCELADO = "cancelado"
    VENCIDO = "vencido"

class TipoPessoa(enum.Enum):
    FISICA = "fisica"
    JURIDICA = "juridica"

class TipoPagamento(enum.Enum):
    DINHEIRO = "dinheiro"
    CARTAO_CREDITO = "cartao_credito"
    CARTAO_DEBITO = "cartao_debito"
    TRANSFERENCIA = "transferencia"
    BOLETO = "boleto"
    PIX = "pix"
    CHEQUE = "cheque"

# Modelo para Categorias
class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    ativa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Modelo para Clientes e Fornecedores
class ClienteFornecedor(Base):
    __tablename__ = "clientes_fornecedores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    nome_fantasia = Column(String(200))
    tipo_pessoa = Column(Enum(TipoPessoa), nullable=False)
    cpf_cnpj = Column(String(18), unique=True, index=True)
    rg_ie = Column(String(20))
    im = Column(String(20))  # Inscrição Municipal
    
    # Endereço
    endereco = Column(String(255))
    numero = Column(String(10))
    complemento = Column(String(100))
    bairro = Column(String(100))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    
    # Contato
    telefone1 = Column(String(20))
    telefone2 = Column(String(20))
    email = Column(String(100))
    site = Column(String(255))
    
    # Dados bancários
    banco = Column(String(100))
    agencia = Column(String(10))
    conta = Column(String(20))
    tipo_conta = Column(String(20))
    pix = Column(String(100))
    
    # CNAE e outros
    cnae_principal = Column(String(10))
    cnae_secundario = Column(String(500))  # Múltiplos CNAEs separados por vírgula
    inscricao_suframa = Column(String(20))
    
    # Flags
    eh_cliente = Column(Boolean, default=False)
    eh_fornecedor = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)
    
    # Observações
    observacoes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Modelo para Telefones e E-mails adicionais
class ContatoClienteFornecedor(Base):
    __tablename__ = "contatos_clientes_fornecedores"

    id = Column(Integer, primary_key=True, index=True)
    cliente_fornecedor_id = Column(Integer, ForeignKey("clientes_fornecedores.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # telefone, email, whatsapp
    valor = Column(String(100), nullable=False)
    descricao = Column(String(100))  # ex: "Comercial", "Residencial", "Celular"
    principal = Column(Boolean, default=False)
    
    cliente_fornecedor = relationship("ClienteFornecedor", backref="contatos")

# Modelo para Anexos
class AnexoClienteFornecedor(Base):
    __tablename__ = "anexos_clientes_fornecedores"

    id = Column(Integer, primary_key=True, index=True)
    cliente_fornecedor_id = Column(Integer, ForeignKey("clientes_fornecedores.id"), nullable=False)
    nome_arquivo = Column(String(255), nullable=False)
    caminho_arquivo = Column(String(500), nullable=False)
    tipo_arquivo = Column(String(50))
    tamanho = Column(Integer)
    descricao = Column(String(255))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    cliente_fornecedor = relationship("ClienteFornecedor", backref="anexos")

class ContaPagar(Base):
    __tablename__ = "contas_pagar"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("clientes_fornecedores.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    conta_corrente_id = Column(Integer, ForeignKey("contas_corrente.id"))
    valor_original = Column(Numeric(15, 2), nullable=False)
    valor_pago = Column(Numeric(15, 2), default=0.0)
    data_vencimento = Column(Date, nullable=False)
    data_emissao = Column(Date)
    numero_documento = Column(String(50))
    status = Column(Enum(StatusConta), default=StatusConta.PENDENTE)
    observacoes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relacionamentos
    user = relationship("User", backref="contas_pagar")
    fornecedor = relationship("ClienteFornecedor", backref="contas_pagar")
    categoria = relationship("Categoria", backref="contas_pagar")
    conta_corrente = relationship("ContaCorrente", backref="contas_pagar")

# Modelo para Pagamentos
class Pagamento(Base):
    __tablename__ = "pagamentos"

    id = Column(Integer, primary_key=True, index=True)
    conta_pagar_id = Column(Integer, ForeignKey("contas_pagar.id"), nullable=False)
    conta_corrente_id = Column(Integer, ForeignKey("contas_corrente.id"))
    valor = Column(Numeric(15, 2), nullable=False)
    data_pagamento = Column(Date, nullable=False)
    tipo_pagamento = Column(Enum(TipoPagamento), nullable=False)
    numero_documento = Column(String(50))  # Número do cheque, comprovante, etc.
    observacoes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relacionamentos
    conta_pagar = relationship("ContaPagar", backref="pagamentos")
    conta_corrente = relationship("ContaCorrente", backref="pagamentos")
    user = relationship("User", backref="pagamentos")

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
    nome = Column(String(100), nullable=False)  # Nome da conta
    banco = Column(String(100), nullable=False)
    codigo_banco = Column(String(10))
    agencia = Column(String(10), nullable=False)
    conta = Column(String(20), nullable=False)
    digito_conta = Column(String(2))
    tipo_conta = Column(String(20))  # Corrente, Poupança, etc.
    saldo_inicial = Column(Numeric(15, 2), default=0.0)
    saldo_atual = Column(Numeric(15, 2), default=0.0)
    limite = Column(Numeric(15, 2), default=0.0)
    gerente = Column(String(100))
    telefone_banco = Column(String(20))
    observacoes = Column(Text)
    ativa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
