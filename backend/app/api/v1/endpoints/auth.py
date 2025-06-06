from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.crud import crud_user
from app.schemas import User, UserCreate, Token
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    try:
        logger.info(f"Tentativa de login para: {form_data.username}")
        
        # Verificar se usuário existe
        user_exists = crud_user.get_by_email(db, email=form_data.username)
        logger.info(f"Usuário existe: {user_exists is not None}")
        if user_exists:
            logger.info(f"Usuário encontrado - ID: {user_exists.id}, Ativo: {user_exists.is_active}")
        
        # Autenticar usuário
        user = crud_user.authenticate(
            db, email=form_data.username, password=form_data.password
        )
        logger.info(f"Autenticação resultado: {user is not None}")
        
        if not user:
            logger.warning(f"Falha na autenticação para: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Criar token de acesso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        
        logger.info(f"Login bem-sucedido para usuário: {user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/login-form", response_model=dict)
def login_form(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Login alternativo com form data que retorna dados do usuário
    """
    try:
        # Autenticar usuário
        user = crud_user.authenticate(db, email=username, password=password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Criar token de acesso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        
        logger.info(f"Login form bem-sucedido para usuário: {user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/register", response_model=User)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    try:
        # Verificar se usuário já existe
        user = crud_user.get_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado no sistema",
            )
        
        # Criar novo usuário
        user = crud_user.create(db, obj_in=user_in)
        logger.info(f"Novo usuário criado: {user.email}")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/test-token", response_model=User)
def test_token(current_user: User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user

@router.post("/refresh-token", response_model=Token)
def refresh_token(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Refresh access token
    """
    try:
        # Verificar se usuário está ativo
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo"
            )
        
        # Criar novo token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            subject=current_user.id, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao renovar token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )