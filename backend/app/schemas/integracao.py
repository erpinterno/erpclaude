from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class IntegracaoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)
    tipo: str = Field(..., min_length=1, max_length=50)
    descricao: Optional[str] = None
    base_url: Optional[str] = Field(None, max_length=255)
    app_key: Optional[str] = Field(None, max_length=255)
    app_secret: Optional[str] = Field(None, max_length=255)
    token: Optional[str] = Field(None, max_length=500)
    configuracoes_extras: Optional[Dict[str, Any]] = None
    ativo: bool = True

class IntegracaoCreate(IntegracaoBase):
    pass

class IntegracaoUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    tipo: Optional[str] = Field(None, min_length=1, max_length=50)
    descricao: Optional[str] = None
    base_url: Optional[str] = Field(None, max_length=255)
    app_key: Optional[str] = Field(None, max_length=255)
    app_secret: Optional[str] = Field(None, max_length=255)
    token: Optional[str] = Field(None, max_length=500)
    configuracoes_extras: Optional[Dict[str, Any]] = None
    ativo: Optional[bool] = None

class IntegracaoInDB(IntegracaoBase):
    id: int
    testado: bool = False
    ultima_sincronizacao: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Integracao(IntegracaoInDB):
    pass

# Schema para exibição pública (sem dados sensíveis)
class IntegracaoPublic(BaseModel):
    id: int
    nome: str
    tipo: str
    descricao: Optional[str] = None
    base_url: Optional[str] = None
    ativo: bool
    testado: bool
    ultima_sincronizacao: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema para teste de conexão
class IntegracaoTeste(BaseModel):
    sucesso: bool
    mensagem: str
    detalhes: Optional[Dict[str, Any]] = None

# Schemas específicos para diferentes tipos de integração
class IntegracaoOmie(BaseModel):
    nome: str = "Omie"
    tipo: str = "ERP"
    descricao: str = "Integração com sistema Omie ERP"
    base_url: str = "https://app.omie.com.br/api/v1/"
    app_key: str
    app_secret: str
    configuracoes_extras: Optional[Dict[str, Any]] = {
        "timeout": 30,
        "max_retries": 3,
        "registros_por_pagina": 50
    }

class IntegracaoContaAzul(BaseModel):
    nome: str = "ContaAzul"
    tipo: str = "ERP"
    descricao: str = "Integração com sistema ContaAzul"
    base_url: str = "https://api.contaazul.com/"
    token: str
    configuracoes_extras: Optional[Dict[str, Any]] = {
        "timeout": 30,
        "max_retries": 3
    }

# Schema para sincronização
class SincronizacaoRequest(BaseModel):
    integracao_id: int
    tipo_dados: str  # "empresas", "clientes", "fornecedores", etc.
    parametros: Optional[Dict[str, Any]] = None

class SincronizacaoResponse(BaseModel):
    sucesso: bool
    total_processados: int
    total_importados: int
    total_atualizados: int
    total_erros: int
    mensagens: list[str]
    detalhes: Optional[Dict[str, Any]] = None
