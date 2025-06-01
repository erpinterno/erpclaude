from typing import Any, List, Optional, Dict
import httpx
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.schemas.integracao import (
    Integracao, IntegracaoCreate, IntegracaoUpdate, IntegracaoPublic, 
    IntegracaoTeste, IntegracaoOmie, SincronizacaoRequest, SincronizacaoResponse
)

router = APIRouter()

@router.get("/", response_model=dict)
def read_integracoes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tipo: Optional[str] = None,
    ativo_apenas: bool = False,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve integracoes with pagination and search.
    """
    integracoes = crud.integracao.get_multi_with_search(
        db, skip=skip, limit=limit, search=search, tipo=tipo, ativo_apenas=ativo_apenas
    )
    total = crud.integracao.count_with_search(
        db, search=search, tipo=tipo, ativo_apenas=ativo_apenas
    )
    
    # Converter para formato público (sem dados sensíveis)
    items_public = [IntegracaoPublic.from_orm(item) for item in integracoes]
    
    return {
        "items": items_public,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@router.post("/", response_model=IntegracaoPublic)
def create_integracao(
    *,
    db: Session = Depends(deps.get_db),
    integracao_in: IntegracaoCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new integracao.
    """
    # Verificar se nome já existe
    integracao = crud.integracao.get_by_nome(db, nome=integracao_in.nome)
    if integracao:
        raise HTTPException(
            status_code=400,
            detail="Nome da integração já existe no sistema"
        )
    
    integracao = crud.integracao.create(db=db, obj_in=integracao_in)
    return IntegracaoPublic.from_orm(integracao)

@router.put("/{id}", response_model=IntegracaoPublic)
def update_integracao(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    integracao_in: IntegracaoUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an integracao.
    """
    integracao = crud.integracao.get(db=db, id=id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    # Verificar se nome já existe em outra integração
    if integracao_in.nome and integracao_in.nome != integracao.nome:
        existing_integracao = crud.integracao.get_by_nome(db, nome=integracao_in.nome)
        if existing_integracao and existing_integracao.id != id:
            raise HTTPException(
                status_code=400,
                detail="Nome da integração já existe em outra integração"
            )
    
    integracao = crud.integracao.update(db=db, db_obj=integracao, obj_in=integracao_in)
    return IntegracaoPublic.from_orm(integracao)

@router.get("/{id}", response_model=Integracao)
def read_integracao(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get integracao by ID (com dados completos para administradores).
    """
    integracao = crud.integracao.get(db=db, id=id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    # Apenas superusuários podem ver dados completos
    if not current_user.is_superuser:
        return IntegracaoPublic.from_orm(integracao)
    
    return integracao

@router.delete("/{id}")
def delete_integracao(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an integracao.
    """
    integracao = crud.integracao.get(db=db, id=id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    integracao = crud.integracao.remove(db=db, id=id)
    return {"message": "Integração excluída com sucesso"}

@router.post("/{id}/testar", response_model=IntegracaoTeste)
async def testar_integracao(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Test integration connection.
    """
    integracao = crud.integracao.get(db=db, id=id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    try:
        if integracao.nome.lower() == "omie":
            # Testar conexão com Omie
            resultado = await testar_conexao_omie(integracao)
        else:
            # Teste genérico para outras integrações
            resultado = await testar_conexao_generica(integracao)
        
        # Atualizar status de teste na base de dados
        crud.integracao.marcar_como_testado(db, db_obj=integracao, sucesso=resultado["sucesso"])
        
        return IntegracaoTeste(**resultado)
        
    except Exception as e:
        # Marcar como falha no teste
        crud.integracao.marcar_como_testado(db, db_obj=integracao, sucesso=False)
        
        return IntegracaoTeste(
            sucesso=False,
            mensagem=f"Erro ao testar integração: {str(e)}",
            detalhes={"erro": str(e)}
        )

@router.post("/omie/configurar", response_model=IntegracaoPublic)
def configurar_omie(
    *,
    db: Session = Depends(deps.get_db),
    app_key: str,
    app_secret: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Configure Omie integration with provided API keys.
    """
    integracao = crud.integracao.criar_integracao_omie(
        db, app_key=app_key, app_secret=app_secret
    )
    return IntegracaoPublic.from_orm(integracao)

@router.post("/sincronizar", response_model=SincronizacaoResponse)
async def sincronizar_dados(
    *,
    db: Session = Depends(deps.get_db),
    request: SincronizacaoRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Synchronize data from external system.
    """
    integracao = crud.integracao.get(db=db, id=request.integracao_id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    if not integracao.ativo:
        raise HTTPException(status_code=400, detail="Integração não está ativa")
    
    if not integracao.testado:
        raise HTTPException(status_code=400, detail="Integração não foi testada com sucesso")
    
    try:
        if integracao.nome.lower() == "omie" and request.tipo_dados == "empresas":
            # Sincronizar empresas do Omie
            resultado = await sincronizar_empresas_omie(db, integracao, request.parametros or {})
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Sincronização de {request.tipo_dados} não implementada para {integracao.nome}"
            )
        
        # Atualizar timestamp da última sincronização
        crud.integracao.atualizar_ultima_sincronizacao(db, db_obj=integracao)
        
        return resultado
        
    except Exception as e:
        return SincronizacaoResponse(
            sucesso=False,
            total_processados=0,
            total_importados=0,
            total_atualizados=0,
            total_erros=1,
            mensagens=[f"Erro na sincronização: {str(e)}"],
            detalhes={"erro": str(e)}
        )

@router.get("/tipos/disponiveis")
def get_tipos_integracoes(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get available integration types.
    """
    return {
        "tipos": [
            {"codigo": "ERP", "nome": "Sistema ERP", "descricao": "Sistemas de gestão empresarial"},
            {"codigo": "CRM", "nome": "Sistema CRM", "descricao": "Sistemas de relacionamento com cliente"},
            {"codigo": "Financeiro", "nome": "Sistema Financeiro", "descricao": "Sistemas de gestão financeira"},
            {"codigo": "E-commerce", "nome": "E-commerce", "descricao": "Plataformas de comércio eletrônico"},
            {"codigo": "Contabil", "nome": "Sistema Contábil", "descricao": "Sistemas de contabilidade"},
        ]
    }

@router.get("/templates/omie")
def get_template_omie(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get Omie integration template.
    """
    return {
        "nome": "Omie",
        "tipo": "ERP",
        "descricao": "Integração com sistema Omie ERP",
        "base_url": "https://app.omie.com.br/api/v1/",
        "campos_obrigatorios": ["app_key", "app_secret"],
        "configuracoes_extras": {
            "timeout": 30,
            "max_retries": 3,
            "registros_por_pagina": 50
        },
        "documentacao": "https://developer.omie.com.br/"
    }

# Funções auxiliares
async def testar_conexao_omie(integracao) -> Dict[str, Any]:
    """Testar conexão com API do Omie"""
    url = f"{integracao.base_url}geral/empresas/"
    
    payload = {
        "call": "ListarEmpresas",
        "app_key": integracao.app_key,
        "app_secret": integracao.app_secret,
        "param": [{"pagina": 1, "registros_por_pagina": 1}]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=10.0)
        response.raise_for_status()
        
        data = response.json()
        
        if "faultstring" in data:
            return {
                "sucesso": False,
                "mensagem": f"Erro da API Omie: {data['faultstring']}",
                "detalhes": data
            }
        
        return {
            "sucesso": True,
            "mensagem": "Conexão com Omie estabelecida com sucesso",
            "detalhes": {"total_empresas": data.get("total_de_registros", 0)}
        }

async def testar_conexao_generica(integracao) -> Dict[str, Any]:
    """Teste genérico para outras integrações"""
    if not integracao.base_url:
        return {
            "sucesso": False,
            "mensagem": "URL base não configurada",
            "detalhes": {}
        }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(integracao.base_url, timeout=10.0)
            response.raise_for_status()
            
            return {
                "sucesso": True,
                "mensagem": "Conexão estabelecida com sucesso",
                "detalhes": {"status_code": response.status_code}
            }
    except Exception as e:
        return {
            "sucesso": False,
            "mensagem": f"Erro na conexão: {str(e)}",
            "detalhes": {"erro": str(e)}
        }

async def sincronizar_empresas_omie(db: Session, integracao, parametros: Dict[str, Any]) -> SincronizacaoResponse:
    """Sincronizar empresas do Omie"""
    from app.schemas.empresa import EmpresaOmieImport
    
    url = f"{integracao.base_url}geral/empresas/"
    pagina = 1
    registros_por_pagina = parametros.get("registros_por_pagina", 50)
    todas_empresas = []
    
    # Buscar todas as empresas
    while True:
        payload = {
            "call": "ListarEmpresas",
            "app_key": integracao.app_key,
            "app_secret": integracao.app_secret,
            "param": [{
                "pagina": pagina,
                "registros_por_pagina": registros_por_pagina,
                "apenas_importado_api": "N"
            }]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            if "faultstring" in data:
                raise Exception(f"Erro da API Omie: {data['faultstring']}")
            
            empresas = data.get("empresas_cadastro", [])
            if not empresas:
                break
            
            todas_empresas.extend(empresas)
            
            if len(empresas) < registros_por_pagina:
                break
            
            pagina += 1
    
    # Processar empresas
    total_importadas = 0
    total_atualizadas = 0
    total_erros = 0
    mensagens = []
    
    for empresa_data in todas_empresas:
        try:
            empresa_import = EmpresaOmieImport(**empresa_data)
            
            # Verificar se empresa já existe
            existing_empresa = crud.empresa.get_by_codigo_omie(
                db, codigo_cliente_omie=empresa_import.codigo_cliente_omie
            )
            
            if existing_empresa:
                crud.empresa.update_from_omie(db, db_obj=existing_empresa, obj_in=empresa_import)
                total_atualizadas += 1
            else:
                crud.empresa.create_from_omie(db, obj_in=empresa_import)
                total_importadas += 1
                
        except Exception as e:
            total_erros += 1
            mensagens.append(f"Erro ao processar empresa {empresa_data.get('razao_social', 'N/A')}: {str(e)}")
    
    return SincronizacaoResponse(
        sucesso=total_erros == 0,
        total_processados=len(todas_empresas),
        total_importados=total_importadas,
        total_atualizadas=total_atualizadas,
        total_erros=total_erros,
        mensagens=mensagens or ["Sincronização concluída com sucesso"],
        detalhes={
            "integracao": integracao.nome,
            "tipo_dados": "empresas",
            "paginas_processadas": pagina - 1
        }
    )
