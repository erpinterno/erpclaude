from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.empresa import Empresa
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaOmieImport

class CRUDEmpresa(CRUDBase[Empresa, EmpresaCreate, EmpresaUpdate]):
    def get_by_cnpj(self, db: Session, *, cnpj: str) -> Optional[Empresa]:
        return db.query(Empresa).filter(Empresa.cnpj == cnpj).first()
    
    def get_by_codigo_omie(self, db: Session, *, codigo_cliente_omie: int) -> Optional[Empresa]:
        return db.query(Empresa).filter(Empresa.codigo_cliente_omie == codigo_cliente_omie).first()
    
    def get_by_codigo_integracao(self, db: Session, *, codigo_cliente_integracao: str) -> Optional[Empresa]:
        return db.query(Empresa).filter(Empresa.codigo_cliente_integracao == codigo_cliente_integracao).first()
    
    def get_multi_with_search(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        ativo_apenas: bool = False
    ) -> List[Empresa]:
        query = db.query(self.model)
        
        if ativo_apenas:
            query = query.filter(Empresa.inativo == "N")
        
        if search:
            search_filter = or_(
                Empresa.razao_social.ilike(f"%{search}%"),
                Empresa.nome_fantasia.ilike(f"%{search}%"),
                Empresa.cnpj.ilike(f"%{search}%"),
                Empresa.codigo_cliente_integracao.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        return query.offset(skip).limit(limit).all()
    
    def count_with_search(
        self, 
        db: Session, 
        *, 
        search: Optional[str] = None,
        ativo_apenas: bool = False
    ) -> int:
        query = db.query(self.model)
        
        if ativo_apenas:
            query = query.filter(Empresa.inativo == "N")
        
        if search:
            search_filter = or_(
                Empresa.razao_social.ilike(f"%{search}%"),
                Empresa.nome_fantasia.ilike(f"%{search}%"),
                Empresa.cnpj.ilike(f"%{search}%"),
                Empresa.codigo_cliente_integracao.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        return query.count()
    
    def create_from_omie(self, db: Session, *, obj_in: EmpresaOmieImport) -> Empresa:
        """Criar empresa a partir dos dados da API Omie"""
        # Converter data de abertura se fornecida
        data_abertura = None
        if obj_in.data_abertura:
            try:
                # Formato esperado: DD/MM/AAAA
                data_abertura = datetime.strptime(obj_in.data_abertura, "%d/%m/%Y").date()
            except ValueError:
                pass  # Ignora se não conseguir converter
        
        empresa_data = {
            "codigo_cliente_omie": obj_in.codigo_cliente_omie,
            "codigo_cliente_integracao": obj_in.codigo_cliente_integracao,
            "razao_social": obj_in.razao_social,
            "nome_fantasia": obj_in.nome_fantasia,
            "cnpj": obj_in.cnpj,
            "inscricao_estadual": obj_in.inscricao_estadual,
            "inscricao_municipal": obj_in.inscricao_municipal,
            "inscricao_suframa": obj_in.inscricao_suframa,
            "endereco": obj_in.endereco,
            "endereco_numero": obj_in.endereco_numero,
            "bairro": obj_in.bairro,
            "complemento": obj_in.complemento,
            "cidade": obj_in.cidade,
            "estado": obj_in.estado,
            "cep": obj_in.cep,
            "codigo_pais": obj_in.codigo_pais or "1058",
            "telefone1_ddd": obj_in.telefone1_ddd,
            "telefone1_numero": obj_in.telefone1_numero,
            "telefone2_ddd": obj_in.telefone2_ddd,
            "telefone2_numero": obj_in.telefone2_numero,
            "fax_ddd": obj_in.fax_ddd,
            "fax_numero": obj_in.fax_numero,
            "email": obj_in.email,
            "homepage": obj_in.homepage,
            "optante_simples_nacional": obj_in.optante_simples_nacional or "N",
            "data_abertura": data_abertura,
            "cnae": obj_in.cnae,
            "tipo_atividade": obj_in.tipo_atividade or "0",
            "codigo_regime_tributario": obj_in.codigo_regime_tributario or "1",
            "codigo_banco": obj_in.codigo_banco,
            "agencia": obj_in.agencia,
            "conta_corrente": obj_in.conta_corrente,
            "doc_titular": obj_in.doc_titular,
            "nome_titular": obj_in.nome_titular,
            "observacoes": obj_in.observacoes,
            "inativo": obj_in.inativo or "N",
            "bloqueado": obj_in.bloqueado or "N"
        }
        
        db_obj = Empresa(**empresa_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_from_omie(self, db: Session, *, db_obj: Empresa, obj_in: EmpresaOmieImport) -> Empresa:
        """Atualizar empresa com dados da API Omie"""
        # Converter data de abertura se fornecida
        data_abertura = db_obj.data_abertura
        if obj_in.data_abertura:
            try:
                # Formato esperado: DD/MM/AAAA
                data_abertura = datetime.strptime(obj_in.data_abertura, "%d/%m/%Y").date()
            except ValueError:
                pass  # Mantém o valor atual se não conseguir converter
        
        update_data = {
            "codigo_cliente_integracao": obj_in.codigo_cliente_integracao,
            "razao_social": obj_in.razao_social,
            "nome_fantasia": obj_in.nome_fantasia,
            "cnpj": obj_in.cnpj,
            "inscricao_estadual": obj_in.inscricao_estadual,
            "inscricao_municipal": obj_in.inscricao_municipal,
            "inscricao_suframa": obj_in.inscricao_suframa,
            "endereco": obj_in.endereco,
            "endereco_numero": obj_in.endereco_numero,
            "bairro": obj_in.bairro,
            "complemento": obj_in.complemento,
            "cidade": obj_in.cidade,
            "estado": obj_in.estado,
            "cep": obj_in.cep,
            "codigo_pais": obj_in.codigo_pais or db_obj.codigo_pais,
            "telefone1_ddd": obj_in.telefone1_ddd,
            "telefone1_numero": obj_in.telefone1_numero,
            "telefone2_ddd": obj_in.telefone2_ddd,
            "telefone2_numero": obj_in.telefone2_numero,
            "fax_ddd": obj_in.fax_ddd,
            "fax_numero": obj_in.fax_numero,
            "email": obj_in.email,
            "homepage": obj_in.homepage,
            "optante_simples_nacional": obj_in.optante_simples_nacional or db_obj.optante_simples_nacional,
            "data_abertura": data_abertura,
            "cnae": obj_in.cnae,
            "tipo_atividade": obj_in.tipo_atividade or db_obj.tipo_atividade,
            "codigo_regime_tributario": obj_in.codigo_regime_tributario or db_obj.codigo_regime_tributario,
            "codigo_banco": obj_in.codigo_banco,
            "agencia": obj_in.agencia,
            "conta_corrente": obj_in.conta_corrente,
            "doc_titular": obj_in.doc_titular,
            "nome_titular": obj_in.nome_titular,
            "observacoes": obj_in.observacoes,
            "inativo": obj_in.inativo or db_obj.inativo,
            "bloqueado": obj_in.bloqueado or db_obj.bloqueado
        }
        
        return self.update(db, db_obj=db_obj, obj_in=update_data)

empresa = CRUDEmpresa(Empresa)
