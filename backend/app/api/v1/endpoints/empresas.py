from typing import Any, List, Optional
import httpx
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.schemas.empresa import (
    Empresa, EmpresaCreate, EmpresaUpdate, EmpresaOmieImport, EmpresaImportResponse
)

router = APIRouter()

@router.get("/", response_model=dict)
def read_empresas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    ativo_apenas: bool = False,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve empresas with pagination and search.
    """
    empresas = crud.empresa.get_multi_with_search(
        db, skip=skip, limit=limit, search=search, ativo_apenas=ativo_apenas
    )
    total = crud.empresa.count_with_search(
        db, search=search, ativo_apenas=ativo_apenas
    )
    
    return {
        "items": empresas,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@router.post("/", response_model=Empresa)
def create_empresa(
    *,
    db: Session = Depends(deps.get_db),
    empresa_in: EmpresaCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new empresa.
    """
    # Verificar se CNPJ já existe
    if empresa_in.cnpj:
        empresa = crud.empresa.get_by_cnpj(db, cnpj=empresa_in.cnpj)
        if empresa:
            raise HTTPException(
                status_code=400,
                detail="CNPJ já cadastrado no sistema"
            )
    
    # Verificar se código de integração já existe
    if empresa_in.codigo_cliente_integracao:
        empresa = crud.empresa.get_by_codigo_integracao(
            db, codigo_cliente_integracao=empresa_in.codigo_cliente_integracao
        )
        if empresa:
            raise HTTPException(
                status_code=400,
                detail="Código de integração já cadastrado no sistema"
            )
    
    empresa = crud.empresa.create(db=db, obj_in=empresa_in)
    return empresa

@router.put("/{id}", response_model=Empresa)
def update_empresa(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    empresa_in: EmpresaUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an empresa.
    """
    empresa = crud.empresa.get(db=db, id=id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    # Verificar se CNPJ já existe em outra empresa
    if empresa_in.cnpj and empresa_in.cnpj != empresa.cnpj:
        existing_empresa = crud.empresa.get_by_cnpj(db, cnpj=empresa_in.cnpj)
        if existing_empresa and existing_empresa.id != id:
            raise HTTPException(
                status_code=400,
                detail="CNPJ já cadastrado em outra empresa"
            )
    
    # Verificar se código de integração já existe em outra empresa
    if (empresa_in.codigo_cliente_integracao and 
        empresa_in.codigo_cliente_integracao != empresa.codigo_cliente_integracao):
        existing_empresa = crud.empresa.get_by_codigo_integracao(
            db, codigo_cliente_integracao=empresa_in.codigo_cliente_integracao
        )
        if existing_empresa and existing_empresa.id != id:
            raise HTTPException(
                status_code=400,
                detail="Código de integração já cadastrado em outra empresa"
            )
    
    empresa = crud.empresa.update(db=db, db_obj=empresa, obj_in=empresa_in)
    return empresa

@router.get("/{id}", response_model=Empresa)
def read_empresa(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get empresa by ID.
    """
    empresa = crud.empresa.get(db=db, id=id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa

@router.delete("/{id}")
def delete_empresa(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an empresa.
    """
    empresa = crud.empresa.get(db=db, id=id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    empresa = crud.empresa.remove(db=db, id=id)
    return {"message": "Empresa excluída com sucesso"}

@router.post("/import-omie", response_model=EmpresaImportResponse)
async def import_empresas_omie(
    *,
    db: Session = Depends(deps.get_db),
    empresas_data: List[EmpresaOmieImport],
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Import empresas from Omie API data.
    """
    total_importadas = 0
    total_atualizadas = 0
    total_erros = 0
    empresas_importadas = []
    empresas_atualizadas = []
    erros = []
    
    for empresa_data in empresas_data:
        try:
            # Verificar se empresa já existe pelo código Omie
            existing_empresa = crud.empresa.get_by_codigo_omie(
                db, codigo_cliente_omie=empresa_data.codigo_cliente_omie
            )
            
            if existing_empresa:
                # Atualizar empresa existente
                updated_empresa = crud.empresa.update_from_omie(
                    db, db_obj=existing_empresa, obj_in=empresa_data
                )
                total_atualizadas += 1
                empresas_atualizadas.append(f"{updated_empresa.razao_social} (ID: {updated_empresa.id})")
            else:
                # Verificar se já existe empresa com mesmo CNPJ
                if empresa_data.cnpj:
                    existing_cnpj = crud.empresa.get_by_cnpj(db, cnpj=empresa_data.cnpj)
                    if existing_cnpj:
                        erros.append(f"CNPJ {empresa_data.cnpj} já existe no sistema (Empresa: {existing_cnpj.razao_social})")
                        total_erros += 1
                        continue
                
                # Criar nova empresa
                new_empresa = crud.empresa.create_from_omie(db, obj_in=empresa_data)
                total_importadas += 1
                empresas_importadas.append(f"{new_empresa.razao_social} (ID: {new_empresa.id})")
                
        except Exception as e:
            total_erros += 1
            erros.append(f"Erro ao processar empresa {empresa_data.razao_social}: {str(e)}")
    
    return EmpresaImportResponse(
        total_importadas=total_importadas,
        total_atualizadas=total_atualizadas,
        total_erros=total_erros,
        empresas_importadas=empresas_importadas,
        empresas_atualizadas=empresas_atualizadas,
        erros=erros
    )

@router.get("/omie/listar", response_model=dict)
async def listar_empresas_omie(
    *,
    app_key: str,
    app_secret: str,
    pagina: int = 1,
    registros_por_pagina: int = 50,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List empresas from Omie API.
    Requires app_key and app_secret from Omie.
    """
    url = "https://app.omie.com.br/api/v1/geral/empresas/"
    
    payload = {
        "call": "ListarEmpresas",
        "app_key": app_key,
        "app_secret": app_secret,
        "param": [
            {
                "pagina": pagina,
                "registros_por_pagina": registros_por_pagina,
                "apenas_importado_api": "N"
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            
            data = response.json()
            
            if "faultstring" in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Erro da API Omie: {data['faultstring']}"
                )
            
            return data
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao conectar com a API Omie: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado: {str(e)}"
        )

@router.post("/omie/importar-automatico")
async def importar_empresas_omie_automatico(
    *,
    db: Session = Depends(deps.get_db),
    app_key: str,
    app_secret: str,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Import all empresas from Omie API automatically.
    This runs in background to avoid timeout.
    """
    
    async def import_task():
        try:
            # Buscar todas as empresas da API Omie
            url = "https://app.omie.com.br/api/v1/geral/empresas/"
            pagina = 1
            registros_por_pagina = 50
            todas_empresas = []
            
            while True:
                payload = {
                    "call": "ListarEmpresas",
                    "app_key": app_key,
                    "app_secret": app_secret,
                    "param": [
                        {
                            "pagina": pagina,
                            "registros_por_pagina": registros_por_pagina,
                            "apenas_importado_api": "N"
                        }
                    ]
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, json=payload, timeout=30.0)
                    response.raise_for_status()
                    data = response.json()
                    
                    if "faultstring" in data:
                        print(f"Erro da API Omie: {data['faultstring']}")
                        break
                    
                    empresas = data.get("empresas_cadastro", [])
                    if not empresas:
                        break
                    
                    todas_empresas.extend(empresas)
                    
                    # Verificar se há mais páginas
                    if len(empresas) < registros_por_pagina:
                        break
                    
                    pagina += 1
            
            # Converter para formato de importação
            empresas_import = []
            for empresa in todas_empresas:
                empresa_import = EmpresaOmieImport(**empresa)
                empresas_import.append(empresa_import)
            
            # Importar empresas
            # Aqui você precisaria chamar a função de importação
            # Como estamos em background task, precisamos de uma nova sessão de DB
            print(f"Importando {len(empresas_import)} empresas do Omie...")
            
        except Exception as e:
            print(f"Erro na importação automática: {str(e)}")
    
    background_tasks.add_task(import_task)
    
    return {
        "message": "Importação iniciada em segundo plano. Verifique os logs para acompanhar o progresso."
    }
