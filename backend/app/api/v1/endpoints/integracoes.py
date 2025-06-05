from typing import Any, List, Optional, Dict
import httpx
import asyncio
import re
import json
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text

from app import crud, models, schemas
from app.api import deps
from app.schemas.integracao import (
    Integracao, IntegracaoCreate, IntegracaoUpdate, IntegracaoPublic, 
    IntegracaoTeste, IntegracaoOmie, SincronizacaoRequest, SincronizacaoResponse,
    IntegracaoLog, IntegracaoLogCreate, LogsRequest, LogsResponse,
    IntegracaoDocumentacao, IntegracaoDocumentacaoCreate,
    ImportarDocumentacaoRequest, ImportarDocumentacaoResponse,
    ExecutarIntegracaoRequest, ExecutarIntegracaoResponse,
    TabelasDisponiveisResponse, TabelaDisponivel,
    ValidarSQLRequest, ValidarSQLResponse,
    TipoIntegracaoEnum, TipoImportacaoEnum, StatusExecucaoEnum
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
    
    # Gerar link da integração automaticamente
    if integracao_in.base_url and integracao_in.metodo_integracao:
        integracao_in.link_integracao = f"{integracao_in.base_url.rstrip('/')}/{integracao_in.metodo_integracao}"
    
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
    
    # Atualizar link da integração se necessário
    if integracao_in.base_url or integracao_in.metodo_integracao:
        base_url = integracao_in.base_url or integracao.base_url
        metodo = integracao_in.metodo_integracao or integracao.metodo_integracao
        if base_url and metodo:
            integracao_in.link_integracao = f"{base_url.rstrip('/')}/{metodo}"
    
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

@router.post("/executar", response_model=ExecutarIntegracaoResponse)
async def executar_integracao(
    *,
    db: Session = Depends(deps.get_db),
    request: ExecutarIntegracaoRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Execute integration manually.
    """
    integracao = crud.integracao.get(db=db, id=request.integracao_id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    if not integracao.ativo:
        raise HTTPException(status_code=400, detail="Integração não está ativa")
    
    try:
        # Criar log de execução
        log_data = IntegracaoLogCreate(
            integracao_id=integracao.id,
            status=StatusExecucaoEnum.RUNNING,
            mensagem="Execução iniciada manualmente"
        )
        log = crud.integracao_log.create(db=db, obj_in=log_data)
        
        if request.executar_agora:
            # Executar em background
            background_tasks.add_task(
                executar_integracao_background, 
                db, integracao, log.id, request.parametros
            )
        
        return ExecutarIntegracaoResponse(
            sucesso=True,
            mensagem="Execução iniciada com sucesso",
            log_id=log.id
        )
        
    except Exception as e:
        return ExecutarIntegracaoResponse(
            sucesso=False,
            mensagem=f"Erro ao executar integração: {str(e)}",
            detalhes={"erro": str(e)}
        )

@router.get("/logs", response_model=LogsResponse)
def get_logs(
    *,
    db: Session = Depends(deps.get_db),
    integracao_id: Optional[int] = None,
    status: Optional[str] = None,
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get integration execution logs.
    """
    try:
        # Usar o CRUD existente ou implementar uma versão simplificada
        query = db.query(models.IntegracaoLog)
        
        if integracao_id:
            query = query.filter(models.IntegracaoLog.integracao_id == integracao_id)
        
        if status:
            query = query.filter(models.IntegracaoLog.status == status)
        
        if data_inicio:
            from datetime import datetime
            data_inicio_dt = datetime.fromisoformat(data_inicio.replace('Z', '+00:00'))
            query = query.filter(models.IntegracaoLog.data_execucao >= data_inicio_dt)
        
        if data_fim:
            from datetime import datetime
            data_fim_dt = datetime.fromisoformat(data_fim.replace('Z', '+00:00'))
            query = query.filter(models.IntegracaoLog.data_execucao <= data_fim_dt)
        
        # Contar total
        total = query.count()
        
        # Aplicar paginação e ordenação
        logs = query.order_by(models.IntegracaoLog.data_execucao.desc()).offset(skip).limit(limit).all()
        
        return LogsResponse(
            items=logs,
            total=total,
            page=(skip // limit) + 1,
            limit=limit,
            totalPages=(total + limit - 1) // limit if total > 0 else 0
        )
        
    except Exception as e:
        # Retornar resposta vazia em caso de erro
        return LogsResponse(
            items=[],
            total=0,
            page=1,
            limit=limit,
            totalPages=0
        )

@router.post("/importar-documentacao", response_model=ImportarDocumentacaoResponse)
async def importar_documentacao(
    *,
    db: Session = Depends(deps.get_db),
    request: ImportarDocumentacaoRequest,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Import documentation file and auto-fill integration fields.
    """
    integracao = crud.integracao.get(db=db, id=request.integracao_id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    try:
        # Salvar documentação
        doc_data = IntegracaoDocumentacaoCreate(
            integracao_id=request.integracao_id,
            nome_arquivo=request.nome_arquivo,
            conteudo=request.arquivo_conteudo,
            tipo_arquivo=request.tipo_arquivo
        )
        crud.integracao_documentacao.create(db=db, obj_in=doc_data)
        
        # Analisar arquivo e extrair informações
        campos_preenchidos = await analisar_documentacao(
            db, integracao, request.arquivo_conteudo, request.tipo_arquivo
        )
        
        return ImportarDocumentacaoResponse(
            sucesso=True,
            mensagem="Documentação importada e campos preenchidos automaticamente",
            campos_preenchidos=campos_preenchidos
        )
        
    except Exception as e:
        return ImportarDocumentacaoResponse(
            sucesso=False,
            mensagem=f"Erro ao importar documentação: {str(e)}",
            campos_preenchidos=[]
        )

@router.get("/tabelas-disponiveis", response_model=TabelasDisponiveisResponse)
def get_tabelas_disponiveis(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all available database tables for integration with detailed information.
    """
    try:
        # Consultar todas as tabelas do banco de dados SQLite
        result = db.execute(text("""
            SELECT name 
            FROM sqlite_master 
            WHERE type='table' 
            AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        """))
        
        tabelas = []
        
        for row in result:
            table_name = row[0]
            
            # Obter informações das colunas para cada tabela SQLite
            columns_result = db.execute(text(f"PRAGMA table_info({table_name})"))
            
            campos = []
            campos_detalhados = []
            
            for col_row in columns_result:
                # PRAGMA table_info retorna: cid, name, type, notnull, dflt_value, pk
                campo_nome = col_row[1]
                campo_tipo = col_row[2]
                campo_nullable = not bool(col_row[3])  # notnull é 0 ou 1
                campo_default = col_row[4]
                campo_pk = bool(col_row[5])  # pk é 0 ou 1
                
                campos.append(campo_nome)
                campos_detalhados.append({
                    "nome": campo_nome,
                    "tipo": campo_tipo,
                    "nullable": campo_nullable,
                    "default": campo_default,
                    "comentario": "",
                    "chave": "PRI" if campo_pk else ""
                })
            
            # Definir descrições personalizadas para tabelas conhecidas
            descricoes_personalizadas = {
                "users": "Tabela de usuários do sistema",
                "empresas": "Tabela de empresas cadastradas",
                "clientes_fornecedores": "Tabela de clientes e fornecedores",
                "contatos_clientes_fornecedores": "Tabela de contatos adicionais de clientes/fornecedores",
                "anexos_clientes_fornecedores": "Tabela de anexos de clientes/fornecedores",
                "categorias": "Tabela de categorias para classificação",
                "contas_pagar": "Tabela de contas a pagar",
                "contas_receber": "Tabela de contas a receber",
                "contas_corrente": "Tabela de contas correntes bancárias",
                "pagamentos": "Tabela de pagamentos realizados",
                "integracoes": "Tabela de configurações de integrações",
                "integracoes_logs": "Tabela de logs de execução das integrações",
                "integracoes_documentacao": "Tabela de documentação das integrações"
            }
            
            descricao = descricoes_personalizadas.get(table_name, f"Tabela {table_name}")
            
            tabela = TabelaDisponivel(
                nome=table_name,
                descricao=descricao,
                campos=campos,
                campos_detalhados=campos_detalhados
            )
            
            tabelas.append(tabela)
        
        return TabelasDisponiveisResponse(tabelas=tabelas)
        
    except Exception as e:
        # Em caso de erro, retornar tabelas básicas conhecidas
        tabelas_basicas = [
            TabelaDisponivel(
                nome="users",
                descricao="Tabela de usuários do sistema",
                campos=["id", "email", "full_name", "is_active", "is_superuser", "created_at", "updated_at"]
            ),
            TabelaDisponivel(
                nome="empresas",
                descricao="Tabela de empresas cadastradas",
                campos=["id", "razao_social", "nome_fantasia", "cnpj", "inscricao_estadual", "endereco", "telefone1_numero", "email"]
            ),
            TabelaDisponivel(
                nome="clientes_fornecedores",
                descricao="Tabela de clientes e fornecedores",
                campos=["id", "nome", "nome_fantasia", "cpf_cnpj", "email", "telefone1", "endereco", "eh_cliente", "eh_fornecedor", "ativo"]
            ),
            TabelaDisponivel(
                nome="categorias",
                descricao="Tabela de categorias para classificação",
                campos=["id", "nome", "descricao", "ativa", "created_at", "updated_at"]
            ),
            TabelaDisponivel(
                nome="contas_pagar",
                descricao="Tabela de contas a pagar",
                campos=["id", "descricao", "fornecedor_id", "categoria_id", "valor_original", "valor_pago", "data_vencimento", "status"]
            ),
            TabelaDisponivel(
                nome="contas_receber",
                descricao="Tabela de contas a receber",
                campos=["id", "descricao", "cliente", "valor", "data_vencimento", "data_recebimento", "status"]
            ),
            TabelaDisponivel(
                nome="contas_corrente",
                descricao="Tabela de contas correntes bancárias",
                campos=["id", "nome", "banco", "agencia", "conta", "saldo_atual", "limite", "ativa"]
            ),
            TabelaDisponivel(
                nome="pagamentos",
                descricao="Tabela de pagamentos realizados",
                campos=["id", "conta_pagar_id", "valor", "data_pagamento", "tipo_pagamento", "numero_documento"]
            ),
            TabelaDisponivel(
                nome="integracoes",
                descricao="Tabela de configurações de integrações",
                campos=["id", "nome", "tipo", "base_url", "metodo_integracao", "tabela_destino", "ativo", "testado"]
            ),
            TabelaDisponivel(
                nome="integracoes_logs",
                descricao="Tabela de logs de execução das integrações",
                campos=["id", "integracao_id", "data_execucao", "status", "mensagem", "registros_processados"]
            )
        ]
        
        return TabelasDisponiveisResponse(tabelas=tabelas_basicas)

@router.post("/validar-sql", response_model=ValidarSQLResponse)
def validar_sql(
    *,
    db: Session = Depends(deps.get_db),
    request: ValidarSQLRequest,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Validate SQL query.
    """
    try:
        # Validar sintaxe SQL básica
        if not request.consulta_sql.strip().upper().startswith('SELECT'):
            return ValidarSQLResponse(
                valida=False,
                mensagem="Apenas consultas SELECT são permitidas",
                erro="Consulta deve começar com SELECT"
            )
        
        # Tentar executar a consulta com LIMIT 0 para validar sintaxe
        consulta_teste = f"SELECT * FROM ({request.consulta_sql}) AS subquery LIMIT 0"
        
        try:
            result = db.execute(text(consulta_teste))
            campos = list(result.keys()) if result.keys() else []
            
            return ValidarSQLResponse(
                valida=True,
                mensagem="Consulta SQL válida",
                campos_retornados=campos
            )
        except Exception as e:
            return ValidarSQLResponse(
                valida=False,
                mensagem="Erro na sintaxe SQL",
                erro=str(e)
            )
            
    except Exception as e:
        return ValidarSQLResponse(
            valida=False,
            mensagem="Erro ao validar SQL",
            erro=str(e)
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
        ],
        "tipos_requisicao": [
            {"codigo": "GET", "nome": "GET", "descricao": "Buscar dados do sistema externo"},
            {"codigo": "POST", "nome": "POST", "descricao": "Enviar dados para o sistema externo"},
            {"codigo": "PUT", "nome": "PUT", "descricao": "Atualizar dados no sistema externo"},
            {"codigo": "DELETE", "nome": "DELETE", "descricao": "Excluir dados do sistema externo"},
        ],
        "tipos_importacao": [
            {"codigo": "TOTAL", "nome": "Total", "descricao": "Substitui todos os dados (deleta e insere)"},
            {"codigo": "INCREMENTAL", "nome": "Incremental", "descricao": "Importa apenas dados novos ou alterados"},
        ]
    }

@router.get("/templates/omie")
def get_template_omie(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get Omie integration template based on ClientesCadastroJsonClient.php.
    """
    return {
        "nome": "Integração Omie - Clientes",
        "tipo": "ERP",
        "descricao": "Integração com sistema Omie ERP para sincronização de clientes",
        "base_url": "https://app.omie.com.br/api/v1/geral/clientes/",
        "metodo_integracao": "ListarClientes",
        "tipo_requisicao": "POST",
        "tipo_importacao": "INCREMENTAL",
        "tabela_destino": "clientes_fornecedores",
        "estrutura_dados": {
            "call": "ListarClientes",
            "param": [{
                "pagina": 1,
                "registros_por_pagina": 50,
                "apenas_importado_api": "N"
            }],
            "app_key": "{{APP_KEY}}",
            "app_secret": "{{APP_SECRET}}"
        },
        "formato_exemplo": """{
    "pagina": 1,
    "total_de_paginas": 1,
    "registros": 2,
    "total_de_registros": 2,
    "clientes_cadastro_resumido": [
        {
            "codigo_cliente": 123456,
            "codigo_cliente_integracao": "CLI001",
            "razao_social": "Empresa Exemplo Ltda",
            "nome_fantasia": "Empresa Exemplo",
            "cnpj_cpf": "12.345.678/0001-90"
        }
    ]
}""",
        "campos_obrigatorios": ["app_key", "app_secret"],
        "configuracoes_extras": {
            "timeout": 30,
            "max_retries": 3,
            "registros_por_pagina": 50
        },
        "link_documentacao": "https://developer.omie.com.br/",
        "intervalo_execucao": 60,  # 1 hora
        "cron_expression": "0 * * * *"  # A cada hora
    }

@router.post("/omie/sincronizar-clientes", response_model=SincronizacaoResponse)
async def sincronizar_clientes_omie(
    *,
    db: Session = Depends(deps.get_db),
    integracao_id: int,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Sincronizar clientes/fornecedores do Omie baseado no ClientesCadastroJsonClient.php
    """
    integracao = crud.integracao.get(db=db, id=integracao_id)
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    if not integracao.ativo:
        raise HTTPException(status_code=400, detail="Integração não está ativa")
    
    if not integracao.app_key or not integracao.app_secret:
        raise HTTPException(status_code=400, detail="APP_KEY e APP_SECRET são obrigatórios")
    
    try:
        # Criar log de execução
        log_data = IntegracaoLogCreate(
            integracao_id=integracao.id,
            status=StatusExecucaoEnum.RUNNING,
            mensagem="Sincronização de clientes Omie iniciada"
        )
        log = crud.integracao_log.create(db=db, obj_in=log_data)
        
        # Executar sincronização em background
        background_tasks.add_task(
            sincronizar_clientes_omie_background, 
            db, integracao, log.id
        )
        
        return SincronizacaoResponse(
            sucesso=True,
            total_processados=0,
            total_importados=0,
            total_atualizados=0,
            total_erros=0,
            mensagens=["Sincronização iniciada com sucesso"],
            detalhes={"log_id": log.id}
        )
        
    except Exception as e:
        return SincronizacaoResponse(
            sucesso=False,
            total_processados=0,
            total_importados=0,
            total_atualizados=0,
            total_erros=1,
            mensagens=[f"Erro ao iniciar sincronização: {str(e)}"],
            detalhes={"erro": str(e)}
        )

# Funções auxiliares
async def testar_conexao_omie(integracao) -> Dict[str, Any]:
    """Testar conexão com API do Omie"""
    url = integracao.base_url or "https://app.omie.com.br/api/v1/geral/clientes/"
    
    payload = {
        "call": "ListarClientes",
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
            "detalhes": {"total_registros": data.get("total_de_registros", 0)}
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
            if integracao.tipo_requisicao == TipoIntegracaoEnum.GET:
                response = await client.get(integracao.base_url, timeout=10.0)
            else:
                response = await client.post(integracao.base_url, json={}, timeout=10.0)
            
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

async def executar_integracao_background(db: Session, integracao, log_id: int, parametros: Optional[Dict[str, Any]]):
    """Executar integração em background"""
    import time
    start_time = time.time()
    
    try:
        # Simular execução da integração
        # Aqui você implementaria a lógica específica para cada tipo de integração
        
        if integracao.nome.lower() == "omie":
            resultado = await executar_integracao_omie(db, integracao, parametros)
        else:
            resultado = await executar_integracao_generica(db, integracao, parametros)
        
        # Atualizar log com sucesso
        tempo_execucao = int(time.time() - start_time)
        crud.integracao_log.update_log_success(
            db, log_id=log_id, 
            tempo_execucao=tempo_execucao,
            registros_processados=resultado.get("processados", 0),
            registros_importados=resultado.get("importados", 0),
            registros_atualizados=resultado.get("atualizados", 0)
        )
        
    except Exception as e:
        # Atualizar log com erro
        tempo_execucao = int(time.time() - start_time)
        crud.integracao_log.update_log_error(
            db, log_id=log_id,
            tempo_execucao=tempo_execucao,
            mensagem=str(e)
        )

async def executar_integracao_omie(db: Session, integracao, parametros: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Executar integração específica do Omie"""
    # Implementar lógica específica do Omie baseada no ClientesCadastroJsonClient.php
    return {"processados": 0, "importados": 0, "atualizados": 0}

async def executar_integracao_generica(db: Session, integracao, parametros: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Executar integração genérica"""
    # Implementar lógica genérica
    return {"processados": 0, "importados": 0, "atualizados": 0}

async def sincronizar_clientes_omie_background(db: Session, integracao, log_id: int):
    """Sincronizar clientes do Omie em background baseado no ClientesCadastroJsonClient.php"""
    import time
    from app.models.financeiro import ClienteFornecedor, TipoPessoa
    
    start_time = time.time()
    total_processados = 0
    total_importados = 0
    total_atualizados = 0
    total_erros = 0
    mensagens = []
    
    try:
        # URL da API do Omie
        url = integracao.base_url or "https://app.omie.com.br/api/v1/geral/clientes/"
        
        # Configurações da integração
        config = integracao.configuracoes_extras or {}
        registros_por_pagina = config.get("registros_por_pagina", 50)
        timeout = config.get("timeout", 30)
        
        pagina_atual = 1
        total_paginas = 1
        
        # Processar todas as páginas
        while pagina_atual <= total_paginas:
            try:
                # Payload baseado no ClientesCadastroJsonClient.php
                payload = {
                    "call": "ListarClientes",
                    "app_key": integracao.app_key,
                    "app_secret": integracao.app_secret,
                    "param": [{
                        "pagina": pagina_atual,
                        "registros_por_pagina": registros_por_pagina,
                        "apenas_importado_api": "N"
                    }]
                }
                
                # Fazer requisição para API do Omie
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, json=payload, timeout=timeout)
                    response.raise_for_status()
                    
                    data = response.json()
                    
                    # Verificar se houve erro na API
                    if "faultstring" in data:
                        raise Exception(f"Erro da API Omie: {data['faultstring']}")
                    
                    # Atualizar informações de paginação
                    total_paginas = data.get("total_de_paginas", 1)
                    total_registros = data.get("total_de_registros", 0)
                    
                    # Processar clientes da página atual
                    clientes = data.get("clientes_cadastro_resumido", [])
                    
                    for cliente_data in clientes:
                        try:
                            total_processados += 1
                            
                            # Mapear dados do Omie para o modelo local
                            cliente_mapeado = mapear_cliente_omie(cliente_data)
                            
                            # Verificar se cliente já existe (por CPF/CNPJ ou código de integração)
                            cliente_existente = None
                            
                            if cliente_mapeado.get("cpf_cnpj"):
                                cliente_existente = db.query(ClienteFornecedor).filter(
                                    ClienteFornecedor.cpf_cnpj == cliente_mapeado["cpf_cnpj"]
                                ).first()
                            
                            if not cliente_existente and cliente_data.get("codigo_cliente_integracao"):
                                # Buscar por código de integração nas observações
                                cliente_existente = db.query(ClienteFornecedor).filter(
                                    ClienteFornecedor.observacoes.like(f"%{cliente_data['codigo_cliente_integracao']}%")
                                ).first()
                            
                            if cliente_existente:
                                # Atualizar cliente existente
                                for key, value in cliente_mapeado.items():
                                    if value is not None:
                                        setattr(cliente_existente, key, value)
                                
                                db.commit()
                                total_atualizados += 1
                                
                            else:
                                # Criar novo cliente
                                novo_cliente = ClienteFornecedor(**cliente_mapeado)
                                db.add(novo_cliente)
                                db.commit()
                                total_importados += 1
                            
                        except Exception as e:
                            total_erros += 1
                            mensagens.append(f"Erro ao processar cliente {cliente_data.get('razao_social', 'N/A')}: {str(e)}")
                            db.rollback()
                            continue
                
                pagina_atual += 1
                
                # Pequena pausa entre páginas para não sobrecarregar a API
                await asyncio.sleep(0.5)
                
            except Exception as e:
                total_erros += 1
                mensagens.append(f"Erro ao processar página {pagina_atual}: {str(e)}")
                break
        
        # Atualizar log com sucesso
        tempo_execucao = int(time.time() - start_time)
        
        # Atualizar log no banco
        log = db.query(models.IntegracaoLog).filter(models.IntegracaoLog.id == log_id).first()
        if log:
            log.status = StatusExecucaoEnum.SUCCESS
            log.tempo_execucao = tempo_execucao
            log.registros_processados = total_processados
            log.registros_importados = total_importados
            log.registros_atualizados = total_atualizados
            log.registros_erro = total_erros
            log.mensagem = f"Sincronização concluída: {total_importados} importados, {total_atualizados} atualizados, {total_erros} erros"
            log.detalhes = {
                "total_processados": total_processados,
                "total_importados": total_importados,
                "total_atualizados": total_atualizados,
                "total_erros": total_erros,
                "mensagens": mensagens[:10]  # Limitar mensagens de erro
            }
            db.commit()
        
        # Atualizar timestamp da última sincronização
        crud.integracao.atualizar_ultima_sincronizacao(db, db_obj=integracao)
        
    except Exception as e:
        # Atualizar log com erro
        tempo_execucao = int(time.time() - start_time)
        
        log = db.query(models.IntegracaoLog).filter(models.IntegracaoLog.id == log_id).first()
        if log:
            log.status = StatusExecucaoEnum.ERROR
            log.tempo_execucao = tempo_execucao
            log.registros_processados = total_processados
            log.registros_importados = total_importados
            log.registros_atualizados = total_atualizados
            log.registros_erro = total_erros + 1
            log.mensagem = f"Erro na sincronização: {str(e)}"
            log.detalhes = {
                "erro": str(e),
                "total_processados": total_processados,
                "mensagens": mensagens
            }
            db.commit()

def mapear_cliente_omie(cliente_data: Dict[str, Any]) -> Dict[str, Any]:
    """Mapear dados do cliente do Omie para o modelo local"""
    
    # Determinar tipo de pessoa baseado no CPF/CNPJ
    cpf_cnpj = cliente_data.get("cnpj_cpf", "").replace(".", "").replace("/", "").replace("-", "")
    tipo_pessoa = TipoPessoa.JURIDICA if len(cpf_cnpj) == 14 else TipoPessoa.FISICA
    
    # Montar observações com códigos do Omie
    observacoes_parts = []
    if cliente_data.get("codigo_cliente"):
        observacoes_parts.append(f"Código Omie: {cliente_data['codigo_cliente']}")
    if cliente_data.get("codigo_cliente_integracao"):
        observacoes_parts.append(f"Código Integração: {cliente_data['codigo_cliente_integracao']}")
    
    observacoes = " | ".join(observacoes_parts) if observacoes_parts else None
    
    return {
        "nome": cliente_data.get("razao_social", ""),
        "nome_fantasia": cliente_data.get("nome_fantasia"),
        "tipo_pessoa": tipo_pessoa,
        "cpf_cnpj": cpf_cnpj if cpf_cnpj else None,
        "endereco": cliente_data.get("endereco"),
        "numero": cliente_data.get("endereco_numero"),
        "complemento": cliente_data.get("complemento"),
        "bairro": cliente_data.get("bairro"),
        "cidade": cliente_data.get("cidade"),
        "estado": cliente_data.get("estado"),
        "cep": cliente_data.get("cep"),
        "telefone1": cliente_data.get("telefone1_numero"),
        "email": cliente_data.get("email"),
        "site": cliente_data.get("homepage"),
        "rg_ie": cliente_data.get("inscricao_estadual"),
        "im": cliente_data.get("inscricao_municipal"),
        "inscricao_suframa": cliente_data.get("inscricao_suframa"),
        "eh_cliente": True,  # Por padrão, considerar como cliente
        "eh_fornecedor": False,  # Pode ser ajustado conforme necessário
        "ativo": cliente_data.get("inativo", "N") != "S",  # Inverter lógica do inativo
        "observacoes": observacoes
    }

async def analisar_documentacao(db: Session, integracao, conteudo: str, tipo_arquivo: str) -> List[str]:
    """Analisar documentação e preencher campos automaticamente"""
    campos_preenchidos = []
    
    try:
        if tipo_arquivo == "php":
            # Analisar arquivo PHP como o ClientesCadastroJsonClient.php
            
            # Extrair URL base
            url_match = re.search(r'EndPoint\s*=\s*[\'"]([^\'"]+)[\'"]', conteudo)
            if url_match:
                base_url = url_match.group(1)
                crud.integracao.update(db, db_obj=integracao, obj_in={"base_url": base_url})
                campos_preenchidos.append("base_url")
            
            # Extrair métodos disponíveis
            metodos = re.findall(r'function\s+(\w+)\s*\(', conteudo)
            if metodos:
                # Usar o primeiro método encontrado como padrão
                metodo_principal = metodos[0] if metodos else None
                if metodo_principal:
                    crud.integracao.update(db, db_obj=integracao, obj_in={"metodo_integracao": metodo_principal})
                    campos_preenchidos.append("metodo_integracao")
            
            # Extrair estrutura de dados dos comentários
            estrutura_match = re.search(r'@param\s+(\w+)\s+\$(\w+)\s+([^\n]+)', conteudo)
            if estrutura_match:
                estrutura = {
                    "tipo_parametro": estrutura_match.group(1),
                    "nome_parametro": estrutura_match.group(2),
                    "descricao": estrutura_match.group(3)
                }
                crud.integracao.update(db, db_obj=integracao, obj_in={"estrutura_dados": estrutura})
                campos_preenchidos.append("estrutura_dados")
        
        elif tipo_arquivo == "json":
            # Analisar arquivo JSON
            try:
                data = json.loads(conteudo)
                crud.integracao.update(db, db_obj=integracao, obj_in={"estrutura_dados": data})
                campos_preenchidos.append("estrutura_dados")
            except json.JSONDecodeError:
                pass
        
    except Exception as e:
        print(f"Erro ao analisar documentação: {e}")
    
    return campos_preenchidos
