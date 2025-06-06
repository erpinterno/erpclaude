from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Configuração do contexto de senha com bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Criar token de acesso JWT"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    try:
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Erro ao criar token: {e}")
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha"""
    try:
        # Criar uma nova instância para evitar problemas de concorrência
        local_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        result = local_context.verify(plain_password, hashed_password)
        logger.debug(f"Verificação de senha: {result} para hash: {hashed_password[:20]}...")
        return result
    except Exception as e:
        logger.error(f"Erro ao verificar senha: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Gerar hash da senha"""
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Erro ao gerar hash da senha: {e}")
        raise

def verify_token(token: str) -> Optional[dict]:
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expirado")
        return None
    except jwt.JWTError as e:
        logger.warning(f"Token inválido: {e}")
        return None
    except Exception as e:
        logger.error(f"Erro ao verificar token: {e}")
        return None