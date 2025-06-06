from typing import List, Union, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "ERP Claude"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Configurações de segurança
    SECRET_KEY: str = "dev-secret-key-change-in-production-please-use-a-strong-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Configurações de banco de dados
    # Suporte tanto para SQLite (dev) quanto PostgreSQL (prod)
    DATABASE_URL: str = "sqlite:///./erp_database.db"
    
    # Configurações Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Configurações CORS - Permitir múltiplas origens
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:4200",
        "http://localhost:4201", 
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4201",
        "http://0.0.0.0:4200",
        "https://localhost:4200",
        "https://127.0.0.1:4200"
    ]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str):
            import json
            return json.loads(v)
        return []
    
    # Configurações de usuários padrão
    FIRST_SUPERUSER: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "changethis"
    FIRST_SUPERUSER_NAME: str = "Administrador do Sistema"
    
    # Configurações de ambiente
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Configurações de API externa
    API_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    
    # Configurações de logs
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configurações de upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".json", ".xml"]
    
    # Configurações de integração
    INTEGRATION_TIMEOUT: int = 60
    MAX_INTEGRATION_RETRIES: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Permite campos extras
        
    @field_validator("DATABASE_URL", mode='before')
    def validate_database_url(cls, v: str) -> str:
        """Validar URL do banco de dados"""
        # Se estiver em produção e ainda usar SQLite, alertar
        if "sqlite" in v.lower() and os.getenv("ENVIRONMENT") == "production":
            print("⚠️  AVISO: Usando SQLite em produção. Considere usar PostgreSQL.")
        return v

# Instância global das configurações
settings = Settings()

# Configurações específicas do ambiente
if settings.ENVIRONMENT == "production":
    settings.DEBUG = False
    settings.LOG_LEVEL = "WARNING"
    # Sobrescrever configurações para produção
    if os.getenv("DATABASE_URL"):
        settings.DATABASE_URL = os.getenv("DATABASE_URL")
elif settings.ENVIRONMENT == "testing":
    settings.DATABASE_URL = "sqlite:///:memory:"
    settings.ACCESS_TOKEN_EXPIRE_MINUTES = 5  # Tokens mais curtos para teste
