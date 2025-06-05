from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class TipoIntegracaoEnum(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"

class TipoImportacaoEnum(str, Enum):
    TOTAL = "TOTAL"
    INCREMENTAL = "INCREMENTAL"

class StatusExecucaoEnum(str, Enum):
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"
    WARNING = "WARNING"
    RUNNING = "RUNNING"

class IntegracaoBase(BaseModel):
    # Campos obrigatórios
    nome: str = Field(..., min_length=1, max_length=100)
    tipo: str = Field(..., min_length=1, max_length=50)
    tipo_requisicao: TipoIntegracaoEnum = TipoIntegracaoEnum.GET
    tipo_importacao: TipoImportacaoEnum = TipoImportacaoEnum.INCREMENTAL
    
    # Campos opcionais
    descricao: Optional[str] = None
    estrutura_dados: Optional[Dict[str, Any]] = None
    formato_exemplo: Optional[str] = None
    intervalo_execucao: Optional[int] = None  # em minutos
    cron_expression: Optional[str] = Field(None, max_length=100)
    tabela_destino: Optional[str] = Field(None, max_length=100)
    tela_origem: Optional[str] = Field(None, max_length=100)
    consulta_sql: Optional[str] = None
    base_url: Optional[str] = Field(None, max_length=255)
    metodo_integracao: Optional[str] = Field(None, max_length=100)
    app_key: Optional[str] = Field(None, max_length=255)
    app_secret: Optional[str] = Field(None, max_length=255)
    link_integracao: Optional[str] = Field(None, max_length=500)
    link_documentacao: Optional[str] = Field(None, max_length=500)
    token: Optional[str] = Field(None, max_length=500)
    configuracoes_extras: Optional[Dict[str, Any]] = None
    ativo: bool = True

class IntegracaoCreate(IntegracaoBase):
    pass

class IntegracaoUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    tipo: Optional[str] = Field(None, min_length=1, max_length=50)
    tipo_requisicao: Optional[TipoIntegracaoEnum] = None
    tipo_importacao: Optional[TipoImportacaoEnum] = None
    descricao: Optional[str] = None
    estrutura_dados: Optional[Dict[str, Any]] = None
    formato_exemplo: Optional[str] = None
    intervalo_execucao: Optional[int] = None
    cron_expression: Optional[str] = Field(None, max_length=100)
    tabela_destino: Optional[str] = Field(None, max_length=100)
    tela_origem: Optional[str] = Field(None, max_length=100)
    consulta_sql: Optional[str] = None
    base_url: Optional[str] = Field(None, max_length=255)
    metodo_integracao: Optional[str] = Field(None, max_length=100)
    app_key: Optional[str] = Field(None, max_length=255)
    app_secret: Optional[str] = Field(None, max_length=255)
    link_integracao: Optional[str] = Field(None, max_length=500)
    link_documentacao: Optional[str] = Field(None, max_length=500)
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
    tipo_requisicao: TipoIntegracaoEnum
    tipo_importacao: TipoImportacaoEnum
    descricao: Optional[str] = None
    base_url: Optional[str] = None
    metodo_integracao: Optional[str] = None
    link_integracao: Optional[str] = None
    link_documentacao: Optional[str] = None
    tabela_destino: Optional[str] = None
    tela_origem: Optional[str] = None
    intervalo_execucao: Optional[int] = None
    cron_expression: Optional[str] = None
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

# Schemas para logs
class IntegracaoLogBase(BaseModel):
    integracao_id: int
    status: StatusExecucaoEnum
    mensagem: Optional[str] = None
    detalhes: Optional[Dict[str, Any]] = None
    tempo_execucao: Optional[int] = None
    registros_processados: int = 0
    registros_importados: int = 0
    registros_atualizados: int = 0
    registros_erro: int = 0

class IntegracaoLogCreate(IntegracaoLogBase):
    pass

class IntegracaoLog(IntegracaoLogBase):
    id: int
    data_execucao: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Schema para documentação
class IntegracaoDocumentacaoBase(BaseModel):
    integracao_id: int
    nome_arquivo: str = Field(..., max_length=255)
    conteudo: Optional[str] = None
    tipo_arquivo: Optional[str] = Field(None, max_length=10)

class IntegracaoDocumentacaoCreate(IntegracaoDocumentacaoBase):
    pass

class IntegracaoDocumentacao(IntegracaoDocumentacaoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schemas específicos para diferentes tipos de integração
class IntegracaoOmie(BaseModel):
    nome: str = "Omie"
    tipo: str = "ERP"
    descricao: str = "Integração com sistema Omie ERP"
    base_url: str = "https://app.omie.com.br/api/v1/"
    metodo_integracao: str = "ListarClientes"
    tipo_requisicao: TipoIntegracaoEnum = TipoIntegracaoEnum.POST
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
    tipo_requisicao: TipoIntegracaoEnum = TipoIntegracaoEnum.GET
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
    mensagens: List[str]
    detalhes: Optional[Dict[str, Any]] = None

# Schema para importação de documentação
class ImportarDocumentacaoRequest(BaseModel):
    integracao_id: int
    arquivo_conteudo: str
    nome_arquivo: str
    tipo_arquivo: str = "php"  # php, html, json

class ImportarDocumentacaoResponse(BaseModel):
    sucesso: bool
    mensagem: str
    campos_preenchidos: List[str]
    detalhes: Optional[Dict[str, Any]] = None

# Schema para controle de logs
class LogsRequest(BaseModel):
    integracao_id: Optional[int] = None
    status: Optional[StatusExecucaoEnum] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    page: int = 1
    limit: int = 50

class LogsResponse(BaseModel):
    items: List[IntegracaoLog]
    total: int
    page: int
    limit: int
    totalPages: int

# Schema para execução manual
class ExecutarIntegracaoRequest(BaseModel):
    integracao_id: int
    parametros: Optional[Dict[str, Any]] = None
    executar_agora: bool = True

class ExecutarIntegracaoResponse(BaseModel):
    sucesso: bool
    mensagem: str
    log_id: Optional[int] = None
    detalhes: Optional[Dict[str, Any]] = None

# Schema para tabelas disponíveis
class CampoDetalhado(BaseModel):
    nome: str
    tipo: str
    nullable: bool
    default: Optional[str] = None
    comentario: Optional[str] = None
    chave: Optional[str] = None

class TabelaDisponivel(BaseModel):
    nome: str
    descricao: str
    campos: List[str]
    campos_detalhados: Optional[List[Dict[str, Any]]] = None

class TabelasDisponiveisResponse(BaseModel):
    tabelas: List[TabelaDisponivel]

# Schema para validação de SQL
class ValidarSQLRequest(BaseModel):
    consulta_sql: str
    tabela_destino: str

class ValidarSQLResponse(BaseModel):
    valida: bool
    mensagem: str
    campos_retornados: Optional[List[str]] = None
    erro: Optional[str] = None
