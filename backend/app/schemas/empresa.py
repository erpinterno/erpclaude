from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field

class EmpresaBase(BaseModel):
    codigo_cliente_integracao: Optional[str] = None
    razao_social: str = Field(..., min_length=1, max_length=200)
    nome_fantasia: Optional[str] = Field(None, max_length=200)
    cnpj: Optional[str] = Field(None, max_length=18)
    inscricao_estadual: Optional[str] = Field(None, max_length=20)
    inscricao_municipal: Optional[str] = Field(None, max_length=20)
    inscricao_suframa: Optional[str] = Field(None, max_length=20)
    
    # Endereço
    endereco: Optional[str] = Field(None, max_length=255)
    endereco_numero: Optional[str] = Field(None, max_length=10)
    bairro: Optional[str] = Field(None, max_length=100)
    complemento: Optional[str] = Field(None, max_length=100)
    cidade: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=2)
    cep: Optional[str] = Field(None, max_length=10)
    codigo_pais: Optional[str] = Field("1058", max_length=10)
    
    # Contato
    telefone1_ddd: Optional[str] = Field(None, max_length=3)
    telefone1_numero: Optional[str] = Field(None, max_length=15)
    telefone2_ddd: Optional[str] = Field(None, max_length=3)
    telefone2_numero: Optional[str] = Field(None, max_length=15)
    fax_ddd: Optional[str] = Field(None, max_length=3)
    fax_numero: Optional[str] = Field(None, max_length=15)
    email: Optional[str] = Field(None, max_length=100)
    homepage: Optional[str] = Field(None, max_length=255)
    
    # Informações fiscais
    optante_simples_nacional: Optional[str] = Field("N", pattern="^[SN]$")
    data_abertura: Optional[date] = None
    cnae: Optional[str] = Field(None, max_length=10)
    tipo_atividade: Optional[str] = Field("0", pattern="^[0-5]$")
    codigo_regime_tributario: Optional[str] = Field("1", pattern="^[1-3]$")
    
    # Informações bancárias
    codigo_banco: Optional[str] = Field(None, max_length=10)
    agencia: Optional[str] = Field(None, max_length=10)
    conta_corrente: Optional[str] = Field(None, max_length=20)
    doc_titular: Optional[str] = Field(None, max_length=18)
    nome_titular: Optional[str] = Field(None, max_length=100)
    
    # Observações
    observacoes: Optional[str] = None
    
    # Status
    inativo: Optional[str] = Field("N", pattern="^[SN]$")
    bloqueado: Optional[str] = Field("N", pattern="^[SN]$")

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    codigo_cliente_integracao: Optional[str] = None
    razao_social: Optional[str] = Field(None, min_length=1, max_length=200)
    nome_fantasia: Optional[str] = Field(None, max_length=200)
    cnpj: Optional[str] = Field(None, max_length=18)
    inscricao_estadual: Optional[str] = Field(None, max_length=20)
    inscricao_municipal: Optional[str] = Field(None, max_length=20)
    inscricao_suframa: Optional[str] = Field(None, max_length=20)
    
    # Endereço
    endereco: Optional[str] = Field(None, max_length=255)
    endereco_numero: Optional[str] = Field(None, max_length=10)
    bairro: Optional[str] = Field(None, max_length=100)
    complemento: Optional[str] = Field(None, max_length=100)
    cidade: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=2)
    cep: Optional[str] = Field(None, max_length=10)
    codigo_pais: Optional[str] = Field(None, max_length=10)
    
    # Contato
    telefone1_ddd: Optional[str] = Field(None, max_length=3)
    telefone1_numero: Optional[str] = Field(None, max_length=15)
    telefone2_ddd: Optional[str] = Field(None, max_length=3)
    telefone2_numero: Optional[str] = Field(None, max_length=15)
    fax_ddd: Optional[str] = Field(None, max_length=3)
    fax_numero: Optional[str] = Field(None, max_length=15)
    email: Optional[str] = Field(None, max_length=100)
    homepage: Optional[str] = Field(None, max_length=255)
    
    # Informações fiscais
    optante_simples_nacional: Optional[str] = Field(None, pattern="^[SN]$")
    data_abertura: Optional[date] = None
    cnae: Optional[str] = Field(None, max_length=10)
    tipo_atividade: Optional[str] = Field(None, pattern="^[0-5]$")
    codigo_regime_tributario: Optional[str] = Field(None, pattern="^[1-3]$")
    
    # Informações bancárias
    codigo_banco: Optional[str] = Field(None, max_length=10)
    agencia: Optional[str] = Field(None, max_length=10)
    conta_corrente: Optional[str] = Field(None, max_length=20)
    doc_titular: Optional[str] = Field(None, max_length=18)
    nome_titular: Optional[str] = Field(None, max_length=100)
    
    # Observações
    observacoes: Optional[str] = None
    
    # Status
    inativo: Optional[str] = Field(None, pattern="^[SN]$")
    bloqueado: Optional[str] = Field(None, pattern="^[SN]$")

class EmpresaInDB(EmpresaBase):
    id: int
    codigo_cliente_omie: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Empresa(EmpresaInDB):
    pass

# Schemas para importação da API Omie
class EmpresaOmieImport(BaseModel):
    codigo_cliente_omie: int
    codigo_cliente_integracao: Optional[str] = None
    razao_social: str
    nome_fantasia: Optional[str] = None
    cnpj: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    inscricao_suframa: Optional[str] = None
    endereco: Optional[str] = None
    endereco_numero: Optional[str] = None
    bairro: Optional[str] = None
    complemento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    codigo_pais: Optional[str] = None
    telefone1_ddd: Optional[str] = None
    telefone1_numero: Optional[str] = None
    telefone2_ddd: Optional[str] = None
    telefone2_numero: Optional[str] = None
    fax_ddd: Optional[str] = None
    fax_numero: Optional[str] = None
    email: Optional[str] = None
    homepage: Optional[str] = None
    optante_simples_nacional: Optional[str] = None
    data_abertura: Optional[str] = None  # String no formato DD/MM/AAAA
    cnae: Optional[str] = None
    tipo_atividade: Optional[str] = None
    codigo_regime_tributario: Optional[str] = None
    codigo_banco: Optional[str] = None
    agencia: Optional[str] = None
    conta_corrente: Optional[str] = None
    doc_titular: Optional[str] = None
    nome_titular: Optional[str] = None
    observacoes: Optional[str] = None
    inativo: Optional[str] = None
    bloqueado: Optional[str] = None

class EmpresaImportResponse(BaseModel):
    total_importadas: int
    total_atualizadas: int
    total_erros: int
    empresas_importadas: list[str]
    empresas_atualizadas: list[str]
    erros: list[str]
