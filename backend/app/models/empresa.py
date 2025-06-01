from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, Date
from sqlalchemy.sql import func
from app.db.session import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    codigo_cliente_omie = Column(Integer, unique=True, index=True)
    codigo_cliente_integracao = Column(String(50), unique=True, index=True)
    razao_social = Column(String(200), nullable=False)
    nome_fantasia = Column(String(200))
    cnpj = Column(String(18), unique=True, index=True)
    inscricao_estadual = Column(String(20))
    inscricao_municipal = Column(String(20))
    inscricao_suframa = Column(String(20))
    
    # Endereço
    endereco = Column(String(255))
    endereco_numero = Column(String(10))
    bairro = Column(String(100))
    complemento = Column(String(100))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    codigo_pais = Column(String(10), default="1058")  # Brasil
    
    # Contato
    telefone1_ddd = Column(String(3))
    telefone1_numero = Column(String(15))
    telefone2_ddd = Column(String(3))
    telefone2_numero = Column(String(15))
    fax_ddd = Column(String(3))
    fax_numero = Column(String(15))
    email = Column(String(100))
    homepage = Column(String(255))
    
    # Informações fiscais
    optante_simples_nacional = Column(String(1), default="N")  # S/N
    data_abertura = Column(Date)
    cnae = Column(String(10))
    tipo_atividade = Column(String(1), default="0")  # 0=Outros, 1=Industrial, 2=Comercial, 3=Prestação de serviços, 4=Construção civil, 5=Produtor rural
    
    # Regime tributário
    codigo_regime_tributario = Column(String(1), default="1")  # 1=Simples Nacional, 2=Simples Nacional - excesso de sublimite de receita bruta, 3=Regime Normal
    
    # Informações bancárias
    codigo_banco = Column(String(10))
    agencia = Column(String(10))
    conta_corrente = Column(String(20))
    doc_titular = Column(String(18))
    nome_titular = Column(String(100))
    
    # Observações
    observacoes = Column(Text)
    
    # Status
    inativo = Column(String(1), default="N")  # S/N
    bloqueado = Column(String(1), default="N")  # S/N
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
