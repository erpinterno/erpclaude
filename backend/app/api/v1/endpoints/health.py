"""
Endpoints de health check e monitoramento do sistema.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.core.monitoring import create_error_monitor

router = APIRouter()

@router.get("/health")
def health_check() -> Dict[str, Any]:
    """Health check básico da API."""
    return {
        "status": "healthy",
        "message": "API funcionando corretamente"
    }

@router.get("/health/integracoes")
def integracoes_health(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Dict[str, Any]:
    """
    Health check específico para o sistema de integrações.
    Verifica conectividade do banco, status das tabelas e análise de erros.
    """
    try:
        # Cria monitor de erros
        monitor = create_error_monitor(db)
        
        # Obtém status geral do sistema
        health_status = monitor.get_health_status()
        
        return {
            "status": health_status["status"],
            "timestamp": health_status["timestamp"],
            "database": health_status["database"],
            "error_analysis": health_status["errors"],
            "recommendations": health_status["recommendations"],
            "details": {
                "user_id": current_user.id,
                "user_email": current_user.email
            }
        }
        
    except Exception as e:
        return {
            "status": "critical",
            "error": str(e),
            "message": "Falha ao verificar status do sistema de integrações"
        }

@router.get("/health/database")
def database_health(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Dict[str, Any]:
    """
    Verifica especificamente a conectividade e integridade do banco de dados.
    """
    try:
        monitor = create_error_monitor(db)
        db_status = monitor.check_database_connectivity()
        
        return {
            "status": "healthy" if db_status["database_connected"] else "critical",
            "database": db_status,
            "user": {
                "id": current_user.id,
                "email": current_user.email
            }
        }
        
    except Exception as e:
        return {
            "status": "critical",
            "error": str(e),
            "message": "Falha ao verificar conectividade do banco"
        }

@router.post("/health/validate-integracao")
def validate_integracao_data(
    data: Dict[str, Any],
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Dict[str, Any]:
    """
    Valida dados de integração antes do salvamento para detectar problemas precocemente.
    """
    try:
        monitor = create_error_monitor(db)
        validation_result = monitor.validate_integracao_data(data)
        
        return {
            "validation": validation_result,
            "user": {
                "id": current_user.id,
                "email": current_user.email
            }
        }
        
    except Exception as e:
        return {
            "valid": False,
            "errors": [f"Erro durante validação: {str(e)}"],
            "warnings": []
        }

@router.get("/health/error-patterns")
def get_error_patterns(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Dict[str, Any]:
    """
    Analisa padrões de erro durante operações de salvamento.
    """
    try:
        monitor = create_error_monitor(db)
        analysis = monitor.analyze_save_patterns()
        
        return {
            "analysis": analysis,
            "user": {
                "id": current_user.id,
                "email": current_user.email
            }
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "message": "Falha ao analisar padrões de erro"
        }