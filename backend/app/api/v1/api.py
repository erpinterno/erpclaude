from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, contas_pagar, contas_receber, conta_corrente, 
    import_export, empresas, integracoes, clientes_fornecedores, 
    categorias, pagamentos
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(empresas.router, prefix="/empresas", tags=["empresas"])
api_router.include_router(integracoes.router, prefix="/integracoes", tags=["integrações"])
api_router.include_router(clientes_fornecedores.router, prefix="/clientes-fornecedores", tags=["clientes e fornecedores"])
api_router.include_router(categorias.router, prefix="/categorias", tags=["categorias"])
api_router.include_router(conta_corrente.router, prefix="/conta-corrente", tags=["conta corrente"])
api_router.include_router(contas_pagar.router, prefix="/contas-pagar", tags=["contas a pagar"])
api_router.include_router(pagamentos.router, prefix="/pagamentos", tags=["pagamentos"])
api_router.include_router(contas_receber.router, prefix="/contas-receber", tags=["contas a receber"])
api_router.include_router(import_export.router, prefix="/import-export", tags=["importação/exportação"])
