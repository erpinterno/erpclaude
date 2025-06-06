from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve users.
    """
    try:
        users = crud.crud_user.get_multi(db, skip=skip, limit=limit)
        return users
    except Exception as e:
        logger.error(f"Erro ao buscar usuários: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new user.
    """
    try:
        user = crud.crud_user.get_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=400,
                detail="Usuário com este email já existe no sistema",
            )
        
        user = crud.crud_user.create(db, obj_in=user_in)
        logger.info(f"Usuário criado por admin: {user.email}")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: EmailStr = Body(None),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    try:
        current_user_data = jsonable_encoder(current_user)
        user_in = schemas.UserUpdate(**current_user_data)
        
        if password is not None:
            user_in.password = password
        if full_name is not None:
            user_in.full_name = full_name
        if email is not None:
            user_in.email = email
            
        user = crud.crud_user.update(db, db_obj=current_user, obj_in=user_in)
        logger.info(f"Usuário atualizado: {user.email}")
        
        return user
        
    except Exception as e:
        logger.error(f"Erro ao atualizar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    try:
        logger.info(f"Usuário atual solicitado: {current_user.email}")
        return current_user
    except Exception as e:
        logger.error(f"Erro ao buscar usuário atual: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me/profile", response_model=dict)
def read_user_profile(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user profile with additional info.
    """
    try:
        return {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_active": current_user.is_active,
            "is_superuser": current_user.is_superuser,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None
        }
    except Exception as e:
        logger.error(f"Erro ao buscar perfil do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    try:
        user = crud.crud_user.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )
            
        if user == current_user:
            return user
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=400, 
                detail="O usuário não tem privilégios suficientes"
            )
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar usuário por ID: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user.
    """
    try:
        user = crud.crud_user.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuário não existe no sistema",
            )
        
        user = crud.crud_user.update(db, db_obj=user, obj_in=user_in)
        logger.info(f"Usuário atualizado por admin: {user.email}")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.delete("/{user_id}")
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a user.
    """
    try:
        user = crud.crud_user.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado",
            )
        
        if user == current_user:
            raise HTTPException(
                status_code=400,
                detail="Não é possível excluir seu próprio usuário"
            )
        
        crud.crud_user.remove(db=db, id=user_id)
        logger.info(f"Usuário excluído por admin: {user.email}")
        
        return {"message": "Usuário excluído com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao excluir usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )