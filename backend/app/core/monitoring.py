"""
Sistema de monitoramento e análise de erros para operações de integração.
"""

import logging
import traceback
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import json

logger = logging.getLogger(__name__)

class IntegracaoErrorMonitor:
    """Monitor para rastreamento de erros em operações de integração."""
    
    def __init__(self, db: Session):
        self.db = db
        self.errors = []
        
    def log_error(self, 
                  operation: str, 
                  error: Exception, 
                  context: Dict[str, Any] = None,
                  integracao_id: Optional[int] = None):
        """
        Registra um erro durante operação de integração.
        
        Args:
            operation: Nome da operação (ex: 'create_integracao', 'save_integracao')
            error: Exceção capturada
            context: Dados contextuais da operação
            integracao_id: ID da integração relacionada
        """
        error_info = {
            'timestamp': datetime.now().isoformat(),
            'operation': operation,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'traceback': traceback.format_exc(),
            'context': context or {},
            'integracao_id': integracao_id
        }
        
        self.errors.append(error_info)
        
        # Log para arquivo
        logger.error(f"Erro em {operation}: {error}", extra={
            'operation': operation,
            'context': context,
            'integracao_id': integracao_id
        })
        
        # Registra no banco se possível
        try:
            self._save_error_to_db(error_info)
        except Exception as db_error:
            logger.error(f"Erro ao salvar no banco: {db_error}")
    
    def _save_error_to_db(self, error_info: Dict[str, Any]):
        """Salva erro no banco de dados."""
        try:
            # Insere no log de integrações se integracao_id existe
            if error_info.get('integracao_id'):
                insert_query = text("""
                    INSERT INTO integracoes_logs 
                    (integracao_id, data_execucao, status, mensagem, detalhes, registros_processados, registros_importados, registros_atualizados, registros_erro)
                    VALUES (:integracao_id, NOW(), 'ERROR', :mensagem, :detalhes, 0, 0, 0, 1)
                """)
                
                self.db.execute(insert_query, {
                    'integracao_id': error_info['integracao_id'],
                    'mensagem': f"Erro em {error_info['operation']}: {error_info['error_message']}",
                    'detalhes': json.dumps({
                        'error_type': error_info['error_type'],
                        'context': error_info['context'],
                        'traceback': error_info['traceback']
                    })
                })
                self.db.commit()
        except Exception as e:
            logger.error(f"Falha ao registrar erro no banco: {e}")

    def check_database_connectivity(self) -> Dict[str, Any]:
        """Verifica conectividade com o banco de dados."""
        try:
            # Teste básico de conexão
            result = self.db.execute(text("SELECT 1"))
            result.fetchone()
            
            # Verifica tabelas críticas
            tables_check = {}
            critical_tables = ['integracoes', 'integracoes_logs', 'users']
            
            for table in critical_tables:
                try:
                    count_result = self.db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = count_result.scalar()
                    tables_check[table] = {'exists': True, 'count': count}
                except Exception as e:
                    tables_check[table] = {'exists': False, 'error': str(e)}
            
            return {
                'database_connected': True,
                'tables': tables_check,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'database_connected': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def validate_integracao_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida dados de integração antes do salvamento.
        
        Args:
            data: Dados da integração a serem validados
            
        Returns:
            Dict com resultado da validação
        """
        validation_result = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Campos obrigatórios
        required_fields = ['nome', 'tipo', 'tipo_requisicao', 'tipo_importacao']
        for field in required_fields:
            if not data.get(field):
                validation_result['errors'].append(f"Campo obrigatório ausente: {field}")
                validation_result['valid'] = False
        
        # Validação de JSON fields
        json_fields = ['estrutura_dados', 'configuracoes_extras']
        for field in json_fields:
            if data.get(field):
                try:
                    if isinstance(data[field], str):
                        json.loads(data[field])
                except json.JSONDecodeError as e:
                    validation_result['errors'].append(f"JSON inválido em {field}: {e}")
                    validation_result['valid'] = False
        
        # Validação de URL
        if data.get('base_url'):
            url = data['base_url']
            if not (url.startswith('http://') or url.startswith('https://')):
                validation_result['warnings'].append("URL base não contém protocolo (http/https)")
        
        # Validação de intervalo
        if data.get('intervalo_execucao'):
            try:
                intervalo = int(data['intervalo_execucao'])
                if intervalo <= 0:
                    validation_result['errors'].append("Intervalo de execução deve ser maior que zero")
                    validation_result['valid'] = False
            except ValueError:
                validation_result['errors'].append("Intervalo de execução deve ser um número")
                validation_result['valid'] = False
        
        # Validação específica para POST
        if data.get('tipo_requisicao') == 'POST':
            if not data.get('consulta_sql'):
                validation_result['errors'].append("Consulta SQL é obrigatória para requisições POST")
                validation_result['valid'] = False
        
        return validation_result

    def analyze_save_patterns(self) -> Dict[str, Any]:
        """Analisa padrões de falhas durante salvamento."""
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'total_errors': len(self.errors),
            'error_patterns': {},
            'common_operations': {},
            'recommendations': []
        }
        
        if not self.errors:
            return analysis
        
        # Agrupa erros por tipo
        for error in self.errors:
            error_type = error['error_type']
            operation = error['operation']
            
            if error_type not in analysis['error_patterns']:
                analysis['error_patterns'][error_type] = 0
            analysis['error_patterns'][error_type] += 1
            
            if operation not in analysis['common_operations']:
                analysis['common_operations'][operation] = 0
            analysis['common_operations'][operation] += 1
        
        # Gera recomendações baseadas nos padrões
        most_common_error = max(analysis['error_patterns'], key=analysis['error_patterns'].get) if analysis['error_patterns'] else None
        
        if most_common_error:
            if 'ValidationError' in most_common_error:
                analysis['recommendations'].append("Implementar validação mais robusta no frontend")
            elif 'DatabaseError' in most_common_error or 'IntegrityError' in most_common_error:
                analysis['recommendations'].append("Verificar conexão e estrutura do banco de dados")
            elif 'JSONDecodeError' in most_common_error:
                analysis['recommendations'].append("Validar formato JSON antes do envio")
            elif 'TimeoutError' in most_common_error:
                analysis['recommendations'].append("Aumentar timeout das operações ou otimizar consultas")
        
        return analysis

    def get_health_status(self) -> Dict[str, Any]:
        """Retorna status geral de saúde do sistema de integrações."""
        db_status = self.check_database_connectivity()
        error_analysis = self.analyze_save_patterns()
        
        # Determina status geral
        overall_status = "healthy"
        if not db_status['database_connected']:
            overall_status = "critical"
        elif error_analysis['total_errors'] > 10:
            overall_status = "warning"
        elif any(not table_info.get('exists', True) for table_info in db_status['tables'].values()):
            overall_status = "warning"
        
        return {
            'status': overall_status,
            'timestamp': datetime.now().isoformat(),
            'database': db_status,
            'errors': error_analysis,
            'recommendations': self._get_system_recommendations(db_status, error_analysis)
        }
    
    def _get_system_recommendations(self, db_status: Dict, error_analysis: Dict) -> List[str]:
        """Gera recomendações baseadas no status do sistema."""
        recommendations = []
        
        if not db_status['database_connected']:
            recommendations.append("Verificar conexão com banco de dados PostgreSQL")
            recommendations.append("Confirmar se container PostgreSQL está rodando")
        
        for table, info in db_status.get('tables', {}).items():
            if not info.get('exists'):
                recommendations.append(f"Recriar tabela {table} no banco de dados")
        
        if error_analysis['total_errors'] > 5:
            recommendations.append("Investigar padrões de erro recorrentes")
            
        recommendations.extend(error_analysis.get('recommendations', []))
        
        return recommendations

def create_error_monitor(db: Session) -> IntegracaoErrorMonitor:
    """Factory function para criar monitor de erros."""
    return IntegracaoErrorMonitor(db)