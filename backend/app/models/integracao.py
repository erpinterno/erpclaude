from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class Integracao(Base):
    __tablename__ = "integracoes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)  # Nome da integração (ex: "Omie", "ContaAzul", etc.)
    tipo = Column(String(50), nullable=False)  # Tipo da integração (ex: "ERP", "CRM", "Financeiro")
    descricao = Column(Text)
    
    # Configurações da API
    base_url = Column(String(255))  # URL base da API
    app_key = Column(String(255))  # Chave da aplicação
    app_secret = Column(String(255))  # Segredo da aplicação
    token = Column(String(500))  # Token de acesso (se aplicável)
    
    # Configurações adicionais (JSON para flexibilidade)
    configuracoes_extras = Column(JSON)  # Para configurações específicas de cada integração
    
    # Status e controle
    ativo = Column(Boolean, default=True)
    testado = Column(Boolean, default=False)  # Se a conexão foi testada com sucesso
    ultima_sincronizacao = Column(DateTime)  # Última vez que sincronizou dados
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
