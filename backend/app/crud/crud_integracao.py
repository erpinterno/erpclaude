from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.integracao import Integracao, IntegracaoLog, IntegracaoDocumentacao
from app.schemas.integracao import (
    IntegracaoCreate, IntegracaoUpdate, 
    IntegracaoLogCreate, IntegracaoDocumentacaoCreate
)

class CRUDIntegracao(CRUDBase[Integracao, IntegracaoCreate, IntegracaoUpdate]):
    def get_by_nome(self, db: Session, *, nome: str) -> Optional[Integracao]:
        return db.query(Integracao).filter(Integracao.nome == nome).first()
    
    def get_by_tipo(self, db: Session, *, tipo: str) -> List[Integracao]:
        return db.query(Integracao).filter(Integracao.tipo == tipo).all()
    
    def get_ativas(self, db: Session) -> List[Integracao]:
        return db.query(Integracao).filter(Integracao.ativo == True).all()
    
    def get_multi_with_search(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        tipo: Optional[str] = None,
        ativo_apenas: bool = False
    ) -> List[Integracao]:
        query = db.query(self.model)
        
        if ativo_apenas:
            query = query.filter(Integracao.ativo == True)
        
        if tipo:
            query = query.filter(Integracao.tipo == tipo)
        
        if search:
            search_filter = or_(
                Integracao.nome.ilike(f"%{search}%"),
                Integracao.descricao.ilike(f"%{search}%"),
                Integracao.tipo.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        return query.offset(skip).limit(limit).all()
    
    def count_with_search(
        self, 
        db: Session, 
        *, 
        search: Optional[str] = None,
        tipo: Optional[str] = None,
        ativo_apenas: bool = False
    ) -> int:
        query = db.query(self.model)
        
        if ativo_apenas:
            query = query.filter(Integracao.ativo == True)
        
        if tipo:
            query = query.filter(Integracao.tipo == tipo)
        
        if search:
            search_filter = or_(
                Integracao.nome.ilike(f"%{search}%"),
                Integracao.descricao.ilike(f"%{search}%"),
                Integracao.tipo.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        return query.count()
    
    def marcar_como_testado(self, db: Session, *, db_obj: Integracao, sucesso: bool = True) -> Integracao:
        """Marcar integração como testada"""
        db_obj.testado = sucesso
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def atualizar_ultima_sincronizacao(self, db: Session, *, db_obj: Integracao) -> Integracao:
        """Atualizar timestamp da última sincronização"""
        db_obj.ultima_sincronizacao = datetime.utcnow()
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_integracao_omie(self, db: Session) -> Optional[Integracao]:
        """Buscar integração do Omie ativa"""
        return db.query(Integracao).filter(
            Integracao.nome == "Omie",
            Integracao.ativo == True
        ).first()
    
    def criar_integracao_omie(
        self, 
        db: Session, 
        *, 
        app_key: str, 
        app_secret: str,
        nome: str = "Omie",
        descricao: str = "Integração com sistema Omie ERP"
    ) -> Integracao:
        """Criar ou atualizar integração do Omie"""
        # Verificar se já existe
        existing = self.get_integracao_omie(db)
        
        if existing:
            # Atualizar existente
            update_data = {
                "app_key": app_key,
                "app_secret": app_secret,
                "descricao": descricao,
                "ativo": True,
                "testado": False
            }
            return self.update(db, db_obj=existing, obj_in=update_data)
        else:
            # Criar nova
            integracao_data = IntegracaoCreate(
                nome=nome,
                tipo="ERP",
                descricao=descricao,
                base_url="https://app.omie.com.br/api/v1/",
                app_key=app_key,
                app_secret=app_secret,
                configuracoes_extras={
                    "timeout": 30,
                    "max_retries": 3,
                    "registros_por_pagina": 50
                },
                ativo=True
            )
            return self.create(db, obj_in=integracao_data)
    
    def get_configuracao_api(self, db: Session, *, integracao_id: int) -> Optional[Dict[str, Any]]:
        """Obter configurações de API de uma integração"""
        integracao = self.get(db, id=integracao_id)
        if not integracao or not integracao.ativo:
            return None
        
        config = {
            "base_url": integracao.base_url,
            "app_key": integracao.app_key,
            "app_secret": integracao.app_secret,
            "token": integracao.token,
            "configuracoes_extras": integracao.configuracoes_extras or {}
        }
        
        return config

class CRUDIntegracaoLog(CRUDBase[IntegracaoLog, IntegracaoLogCreate, IntegracaoLogCreate]):
    def get_by_integracao(self, db: Session, *, integracao_id: int) -> List[IntegracaoLog]:
        return db.query(IntegracaoLog).filter(IntegracaoLog.integracao_id == integracao_id).all()
    
    def update_log_success(
        self, 
        db: Session, 
        *, 
        log_id: int,
        tempo_execucao: int,
        registros_processados: int = 0,
        registros_importados: int = 0,
        registros_atualizados: int = 0
    ) -> Optional[IntegracaoLog]:
        """Atualizar log com sucesso"""
        log = db.query(IntegracaoLog).filter(IntegracaoLog.id == log_id).first()
        if log:
            from app.models.integracao import StatusExecucao
            log.status = StatusExecucao.SUCCESS
            log.tempo_execucao = tempo_execucao
            log.registros_processados = registros_processados
            log.registros_importados = registros_importados
            log.registros_atualizados = registros_atualizados
            log.mensagem = f"Execução concluída com sucesso: {registros_importados} importados, {registros_atualizados} atualizados"
            db.commit()
            db.refresh(log)
        return log
    
    def update_log_error(
        self, 
        db: Session, 
        *, 
        log_id: int,
        tempo_execucao: int,
        mensagem: str
    ) -> Optional[IntegracaoLog]:
        """Atualizar log com erro"""
        log = db.query(IntegracaoLog).filter(IntegracaoLog.id == log_id).first()
        if log:
            from app.models.integracao import StatusExecucao
            log.status = StatusExecucao.ERROR
            log.tempo_execucao = tempo_execucao
            log.mensagem = mensagem
            db.commit()
            db.refresh(log)
        return log

class CRUDIntegracaoDocumentacao(CRUDBase[IntegracaoDocumentacao, IntegracaoDocumentacaoCreate, IntegracaoDocumentacaoCreate]):
    def get_by_integracao(self, db: Session, *, integracao_id: int) -> List[IntegracaoDocumentacao]:
        return db.query(IntegracaoDocumentacao).filter(IntegracaoDocumentacao.integracao_id == integracao_id).all()
    
    def get_by_nome_arquivo(self, db: Session, *, integracao_id: int, nome_arquivo: str) -> Optional[IntegracaoDocumentacao]:
        return db.query(IntegracaoDocumentacao).filter(
            IntegracaoDocumentacao.integracao_id == integracao_id,
            IntegracaoDocumentacao.nome_arquivo == nome_arquivo
        ).first()

integracao = CRUDIntegracao(Integracao)
integracao_log = CRUDIntegracaoLog(IntegracaoLog)
integracao_documentacao = CRUDIntegracaoDocumentacao(IntegracaoDocumentacao)
