from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Categoria])
def read_categorias(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar categorias.
    """
    categorias = crud.crud_categoria.get_multi(db, skip=skip, limit=limit)
    return categorias

@router.get("/ativas", response_model=List[schemas.Categoria])
def read_categorias_ativas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar apenas categorias ativas.
    """
    categorias = crud.crud_categoria.get_ativas(db, skip=skip, limit=limit)
    return categorias

@router.post("/", response_model=schemas.Categoria)
def create_categoria(
    *,
    db: Session = Depends(deps.get_db),
    categoria_in: schemas.CategoriaCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Criar nova categoria.
    """
    categoria = crud.crud_categoria.create(db=db, obj_in=categoria_in)
    return categoria

@router.put("/{id}", response_model=schemas.Categoria)
def update_categoria(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    categoria_in: schemas.CategoriaUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Atualizar categoria.
    """
    categoria = crud.crud_categoria.get(db=db, id=id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    categoria = crud.crud_categoria.update(
        db=db, db_obj=categoria, obj_in=categoria_in
    )
    return categoria

@router.get("/{id}", response_model=schemas.Categoria)
def read_categoria(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter categoria por ID.
    """
    categoria = crud.crud_categoria.get(db=db, id=id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria

@router.delete("/{id}", response_model=schemas.Categoria)
def delete_categoria(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Deletar categoria.
    """
    categoria = crud.crud_categoria.get(db=db, id=id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    categoria = crud.crud_categoria.remove(db=db, id=id)
    return categoria
