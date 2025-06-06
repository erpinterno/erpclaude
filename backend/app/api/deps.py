from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.crud import crud_user
from app.db.session import SessionLocal
from app.models import User
from app.schemas import TokenPayload
import logging

logger = logging.getLogger(__name__)

# OAuth2 scheme para login por formulário
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

# HTTPBearer scheme para autenticação por Bearer token
security_bearer = HTTPBearer(auto_error=False)

def get_db() -> Generator:
    """Dependency para obter sessão do banco de dados"""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), 
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> User:
    """Dependency para obter usuário atual"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorização necessário",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verificar e decodificar token
        payload = security.verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Extrair ID do usuário do token
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido - ID do usuário não encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Buscar usuário no banco
        user = crud_user.get(db, id=int(user_id))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Usuário não encontrado"
            )
        
        return user
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido - formato incorreto do ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na autenticação: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Erro interno na autenticação",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_oauth(
    db: Session = Depends(get_db), 
    token: str = Depends(reusable_oauth2)
) -> User:
    """Dependency alternativa para OAuth2PasswordBearer"""
    try:
        payload = security.verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado",
            )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
            )
        
        user = crud_user.get(db, id=int(user_id))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Usuário não encontrado"
            )
        
        return user
        
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não foi possível validar as credenciais",
        )

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency para obter usuário ativo"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Usuário inativo"
        )
    return current_user

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency para obter superusuário ativo"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="O usuário não tem privilégios suficientes"
        )
    return current_user