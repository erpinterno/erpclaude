from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.ClienteFornecedor])
def read_clientes_fornecedores(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar clientes e fornecedores.
    """
    clientes_fornecedores = crud.crud_cliente_fornecedor.get_multi(db, skip=skip, limit=limit)
    return clientes_fornecedores

@router.get("/clientes", response_model=List[schemas.ClienteFornecedor])
def read_clientes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar apenas clientes.
    """
    clientes = crud.crud_cliente_fornecedor.get_clientes(db, skip=skip, limit=limit)
    return clientes

@router.get("/fornecedores", response_model=List[schemas.ClienteFornecedor])
def read_fornecedores(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Recuperar apenas fornecedores.
    """
    fornecedores = crud.crud_cliente_fornecedor.get_fornecedores(db, skip=skip, limit=limit)
    return fornecedores

@router.post("/", response_model=schemas.ClienteFornecedor)
def create_cliente_fornecedor(
    *,
    db: Session = Depends(deps.get_db),
    cliente_fornecedor_in: schemas.ClienteFornecedorCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Criar novo cliente/fornecedor.
    """
    # Verificar se CPF/CNPJ já existe
    existing = crud.crud_cliente_fornecedor.get_by_cpf_cnpj(db, cpf_cnpj=cliente_fornecedor_in.cpf_cnpj)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="CPF/CNPJ já cadastrado no sistema."
        )
    
    cliente_fornecedor = crud.crud_cliente_fornecedor.create(db=db, obj_in=cliente_fornecedor_in)
    return cliente_fornecedor

@router.put("/{id}", response_model=schemas.ClienteFornecedor)
def update_cliente_fornecedor(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    cliente_fornecedor_in: schemas.ClienteFornecedorUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Atualizar cliente/fornecedor.
    """
    cliente_fornecedor = crud.crud_cliente_fornecedor.get(db=db, id=id)
    if not cliente_fornecedor:
        raise HTTPException(status_code=404, detail="Cliente/Fornecedor não encontrado")
    
    # Verificar se CPF/CNPJ já existe em outro registro
    if cliente_fornecedor_in.cpf_cnpj:
        existing = crud.crud_cliente_fornecedor.get_by_cpf_cnpj(db, cpf_cnpj=cliente_fornecedor_in.cpf_cnpj)
        if existing and existing.id != id:
            raise HTTPException(
                status_code=400,
                detail="CPF/CNPJ já cadastrado em outro registro."
            )
    
    cliente_fornecedor = crud.crud_cliente_fornecedor.update(
        db=db, db_obj=cliente_fornecedor, obj_in=cliente_fornecedor_in
    )
    return cliente_fornecedor

@router.get("/{id}", response_model=schemas.ClienteFornecedor)
def read_cliente_fornecedor(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter cliente/fornecedor por ID.
    """
    cliente_fornecedor = crud.crud_cliente_fornecedor.get(db=db, id=id)
    if not cliente_fornecedor:
        raise HTTPException(status_code=404, detail="Cliente/Fornecedor não encontrado")
    return cliente_fornecedor

@router.delete("/{id}", response_model=schemas.ClienteFornecedor)
def delete_cliente_fornecedor(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Deletar cliente/fornecedor.
    """
    cliente_fornecedor = crud.crud_cliente_fornecedor.get(db=db, id=id)
    if not cliente_fornecedor:
        raise HTTPException(status_code=404, detail="Cliente/Fornecedor não encontrado")
    
    cliente_fornecedor = crud.crud_cliente_fornecedor.remove(db=db, id=id)
    return cliente_fornecedor

# Endpoints para contatos
@router.post("/{id}/contatos", response_model=schemas.ContatoClienteFornecedor)
def create_contato(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    contato_in: schemas.ContatoClienteFornecedorCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Adicionar contato ao cliente/fornecedor.
    """
    cliente_fornecedor = crud.crud_cliente_fornecedor.get(db=db, id=id)
    if not cliente_fornecedor:
        raise HTTPException(status_code=404, detail="Cliente/Fornecedor não encontrado")
    
    contato_in.cliente_fornecedor_id = id
    contato = crud.crud_contato_cliente_fornecedor.create(db=db, obj_in=contato_in)
    return contato

@router.get("/{id}/contatos", response_model=List[schemas.ContatoClienteFornecedor])
def read_contatos(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter contatos do cliente/fornecedor.
    """
    contatos = crud.crud_contato_cliente_fornecedor.get_by_cliente_fornecedor(
        db=db, cliente_fornecedor_id=id
    )
    return contatos

# Endpoints para anexos
@router.post("/{id}/anexos", response_model=schemas.AnexoClienteFornecedor)
def create_anexo(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    anexo_in: schemas.AnexoClienteFornecedorCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Adicionar anexo ao cliente/fornecedor.
    """
    cliente_fornecedor = crud.crud_cliente_fornecedor.get(db=db, id=id)
    if not cliente_fornecedor:
        raise HTTPException(status_code=404, detail="Cliente/Fornecedor não encontrado")
    
    anexo_in.cliente_fornecedor_id = id
    anexo = crud.crud_anexo_cliente_fornecedor.create(db=db, obj_in=anexo_in)
    return anexo

@router.get("/{id}/anexos", response_model=List[schemas.AnexoClienteFornecedor])
def read_anexos(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Obter anexos do cliente/fornecedor.
    """
    anexos = crud.crud_anexo_cliente_fornecedor.get_by_cliente_fornecedor(
        db=db, cliente_fornecedor_id=id
    )
    return anexos
