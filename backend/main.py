# backend/main.py
import os
import sys
import time
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uvicorn

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configurações - importar das configurações centralizadas
from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.db.init_db import init_db

# Verificar conexão com banco de dados
def check_database_connection():
    """Verificar se o banco de dados está acessível"""
    try:
        # Tentar criar uma sessão e fazer uma consulta simples
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("🗃️ Conexão com banco de dados: ✅ OK")
        return True
    except Exception as e:
        logger.error(f"❌ Erro na conexão com banco de dados: {e}")
        return False

# Inicializar banco de dados
def initialize_database():
    """Inicializar banco de dados com dados padrão"""
    try:
        init_db()
        logger.info("🗃️ Banco de dados inicializado com sucesso!")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco de dados: {e}")
        return False

# Verificar e inicializar banco na inicialização
if check_database_connection():
    initialize_database()
else:
    logger.warning("⚠️ Sistema iniciando sem conexão com banco de dados")

# ==================== FASTAPI APP ====================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sistema ERP desenvolvido com Claude AI - API Backend",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    debug=settings.DEBUG
)

# ==================== MIDDLEWARE ====================

# Middleware de CORS - CONFIGURAÇÃO CORRIGIDA
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRFToken",
        "Cache-Control"
    ],
    expose_headers=["Content-Range", "X-Content-Range"],
    max_age=3600,
)

# Middleware de hosts confiáveis (segurança)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]  # Configure adequadamente em produção
)

# ==================== EXCEPTION HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler customizado para exceções HTTP"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handler para exceções gerais"""
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erro interno do servidor",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

# ==================== HEALTH CHECK ROUTES ====================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"🚀 {settings.PROJECT_NAME} - Backend API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "health": "/health",
        "api": settings.API_V1_STR,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "connected" if check_database_connection() else "disconnected"
    
    health_info = {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": "available"
    }
    
    if db_status == "disconnected":
        return JSONResponse(
            status_code=503,
            content=health_info
        )
    
    return health_info

@app.get("/health/database")
async def database_health():
    """Database specific health check"""
    try:
        from sqlalchemy import text
        db = SessionLocal()
        
        # Teste de consulta simples
        start_time = time.time()
        result = db.execute(text("SELECT COUNT(*) as count FROM users"))
        query_time = time.time() - start_time
        
        user_count = result.scalar()
        db.close()
        
        return {
            "status": "healthy",
            "database_url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "local",
            "query_time_ms": round(query_time * 1000, 2),
            "user_count": user_count,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# ==================== API ROUTERS ====================

# Importar e incluir roteadores da API
try:
    from app.api.v1.api import api_router
    app.include_router(api_router, prefix=settings.API_V1_STR)
    logger.info("✅ API routers incluídos com sucesso!")
    
    # Log das rotas registradas
    logger.info("📋 Rotas registradas:")
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = ', '.join(route.methods)
            logger.info(f"  {methods}: {route.path}")
            
except ImportError as e:
    logger.error(f"❌ Erro ao importar routers da API: {e}")
    logger.info("⚠️ Sistema funcionando em modo básico")

# ==================== STARTUP & SHUTDOWN EVENTS ====================

@app.on_event("startup")
async def startup_event():
    """Eventos na inicialização da aplicação"""
    logger.info(f"🚀 Iniciando {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"🌍 Ambiente: {settings.ENVIRONMENT}")
    logger.info(f"🔧 Debug: {settings.DEBUG}")
    logger.info(f"📊 CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    
    # Verificar configurações críticas
    if settings.SECRET_KEY == "dev-secret-key-change-in-production-please-use-a-strong-secret":
        logger.warning("⚠️ AVISO: Usando chave secreta padrão. Altere em produção!")
    
    if settings.ENVIRONMENT == "production" and settings.DEBUG:
        logger.warning("⚠️ AVISO: Debug habilitado em produção!")

@app.on_event("shutdown")
async def shutdown_event():
    """Eventos no encerramento da aplicação"""
    logger.info("🛑 Encerrando aplicação...")

# ==================== MAIN ====================

if __name__ == "__main__":
    # Configurações do servidor
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    logger.info(f"🌐 Servidor rodando em http://{host}:{port}")
    logger.info(f"📚 Documentação disponível em http://{host}:{port}/docs")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    )
