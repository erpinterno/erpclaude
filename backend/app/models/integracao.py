from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, JSON, Enum
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class TipoIntegracao(enum.Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"

class TipoImportacao(enum.Enum):
    TOTAL = "TOTAL"
    INCREMENTAL = "INCREMENTAL"

class StatusExecucao(enum.Enum):
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"
    WARNING = "WARNING"
    RUNNING = "RUNNING"

class Integracao(Base):
    __tablename__ = "integracoes"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. Nome da integração do terceiro
    nome = Column(String(100), nullable=False)
    
    # 2. Estrutura de dados (JSON)
    estrutura_dados = Column(JSON)
    
    # 3. Formato exemplo que deve ser gerado arquivo
    formato_exemplo = Column(Text)
    
    # 4. Tipo (GET, POST, PUT, DELETE)
    tipo_requisicao = Column(Enum(TipoIntegracao), nullable=False, default=TipoIntegracao.GET)
    
    # 5. Tempo de execução, intervalo de tempo que a integração irá rodar
    intervalo_execucao = Column(Integer)  # em minutos
    cron_expression = Column(String(100))  # expressão cron para agendamento
    
    # 6. Tela ou tabela que a integração deverá inserir ou buscar
    tabela_destino = Column(String(100))
    tela_origem = Column(String(100))
    
    # 7. Para POST deve haver estrutura para cadastrar a consulta (SQL)
    consulta_sql = Column(Text)
    
    # 8. Campo para definir se a importação é total ou incremental
    tipo_importacao = Column(Enum(TipoImportacao), nullable=False, default=TipoImportacao.INCREMENTAL)
    
    # 9. URL base da integração
    base_url = Column(String(255))
    
    # 10. Método (chamada) integração terceiro
    metodo_integracao = Column(String(100))
    
    # 11. Dados de autenticação
    app_key = Column(String(255))  # APP Key / Client ID
    app_secret = Column(String(255))  # APP Secret / Client Secret
    
    # 12. Link da integração (url+método)
    link_integracao = Column(String(500))
    
    # 13. Campo para armazenar link de documentação
    link_documentacao = Column(String(500))
    
    # Campos originais mantidos
    tipo = Column(String(50), nullable=False)  # Tipo da integração (ex: "ERP", "CRM", "Financeiro")
    descricao = Column(Text)
    token = Column(String(500))  # Token de acesso (se aplicável)
    configuracoes_extras = Column(JSON)  # Para configurações específicas de cada integração
    
    # Status e controle
    ativo = Column(Boolean, default=True)
    testado = Column(Boolean, default=False)  # Se a conexão foi testada com sucesso
    ultima_sincronizacao = Column(DateTime)  # Última vez que sincronizou dados
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class IntegracaoLog(Base):
    __tablename__ = "integracoes_logs"

    id = Column(Integer, primary_key=True, index=True)
    integracao_id = Column(Integer, nullable=False)
    data_execucao = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(StatusExecucao), nullable=False)
    mensagem = Column(Text)
    detalhes = Column(JSON)
    tempo_execucao = Column(Integer)  # em segundos
    registros_processados = Column(Integer, default=0)
    registros_importados = Column(Integer, default=0)
    registros_atualizados = Column(Integer, default=0)
    registros_erro = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class IntegracaoDocumentacao(Base):
    __tablename__ = "integracoes_documentacao"

    id = Column(Integer, primary_key=True, index=True)
    integracao_id = Column(Integer, nullable=False)
    nome_arquivo = Column(String(255), nullable=False)
    conteudo = Column(Text)  # Conteúdo do arquivo PHP/HTML
    tipo_arquivo = Column(String(10))  # php, html, json
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
