# backend/main.py
import os
import sys
import time
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, Numeric, ForeignKey, Date, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
import uvicorn

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurações
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# URL do banco de dados - usando SQLite para desenvolvimento
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./erp_database.db")

logger.info(f"🔗 Database URL: {DATABASE_URL}")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ==================== MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Banco(Base):
    __tablename__ = "bancos"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(10), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    nome_fantasia = Column(String(100))
    site = Column(String(255))
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(10), nullable=False)  # RECEITA ou DESPESA
    categoria_pai_id = Column(Integer, ForeignKey("categorias.id"))
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    categoria_pai = relationship("Categoria", remote_side=[id])

class CentroCusto(Base):
    __tablename__ = "centros_custo"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Cliente(Base):
    __tablename__ = "clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    nome_fantasia = Column(String(100))
    cpf_cnpj = Column(String(20), unique=True)
    email = Column(String(100))
    telefone = Column(String(20))
    endereco = Column(String(255))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Fornecedor(Base):
    __tablename__ = "fornecedores"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    nome_fantasia = Column(String(100))
    cpf_cnpj = Column(String(20), unique=True)
    email = Column(String(100))
    telefone = Column(String(20))
    endereco = Column(String(255))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormaPagamento(Base):
    __tablename__ = "formas_pagamento"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PlanoContas(Base):
    __tablename__ = "plano_contas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nome = Column(String(100), nullable=False)
    tipo = Column(String(10), nullable=False)  # ATIVO, PASSIVO, RECEITA, DESPESA
    conta_pai_id = Column(Integer, ForeignKey("plano_contas.id"))
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    conta_pai = relationship("PlanoContas", remote_side=[id])

class ContaPagar(Base):
    __tablename__ = "contas_pagar"
    
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    centro_custo_id = Column(Integer, ForeignKey("centros_custo.id"))
    forma_pagamento_id = Column(Integer, ForeignKey("formas_pagamento.id"))
    valor = Column(Numeric(15, 2), nullable=False)
    data_vencimento = Column(Date, nullable=False)
    data_pagamento = Column(Date)
    status = Column(String(20), default="pendente")  # pendente, pago, cancelado, vencido
    observacoes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    fornecedor = relationship("Fornecedor")
    categoria = relationship("Categoria")
    centro_custo = relationship("CentroCusto")
    forma_pagamento = relationship("FormaPagamento")

class ContaReceber(Base):
    __tablename__ = "contas_receber"
    
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    centro_custo_id = Column(Integer, ForeignKey("centros_custo.id"))
    forma_pagamento_id = Column(Integer, ForeignKey("formas_pagamento.id"))
    valor = Column(Numeric(15, 2), nullable=False)
    data_vencimento = Column(Date, nullable=False)
    data_recebimento = Column(Date)
    status = Column(String(20), default="pendente")  # pendente, recebido, cancelado, vencido
    observacoes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    cliente = relationship("Cliente")
    categoria = relationship("Categoria")
    centro_custo = relationship("CentroCusto")
    forma_pagamento = relationship("FormaPagamento")

class ContaCorrente(Base):
    __tablename__ = "conta_corrente"
    
    id = Column(Integer, primary_key=True, index=True)
    banco_id = Column(Integer, ForeignKey("bancos.id"), nullable=False)
    agencia = Column(String(10))
    conta = Column(String(20))
    saldo_inicial = Column(Numeric(15, 2), default=0)
    saldo_atual = Column(Numeric(15, 2), default=0)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    banco = relationship("Banco")

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    codigo_cliente_omie = Column(Integer, unique=True, index=True)
    codigo_cliente_integracao = Column(String(50), unique=True, index=True)
    razao_social = Column(String(200), nullable=False)
    nome_fantasia = Column(String(200))
    cnpj = Column(String(18), unique=True, index=True)
    inscricao_estadual = Column(String(20))
    inscricao_municipal = Column(String(20))
    inscricao_suframa = Column(String(20))
    
    # Endereço
    endereco = Column(String(255))
    endereco_numero = Column(String(10))
    bairro = Column(String(100))
    complemento = Column(String(100))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    codigo_pais = Column(String(10), default="1058")  # Brasil
    
    # Contato
    telefone1_ddd = Column(String(3))
    telefone1_numero = Column(String(15))
    telefone2_ddd = Column(String(3))
    telefone2_numero = Column(String(15))
    fax_ddd = Column(String(3))
    fax_numero = Column(String(15))
    email = Column(String(100))
    homepage = Column(String(255))
    
    # Informações fiscais
    optante_simples_nacional = Column(String(1), default="N")  # S/N
    data_abertura = Column(Date)
    cnae = Column(String(10))
    tipo_atividade = Column(String(1), default="0")  # 0=Outros, 1=Industrial, 2=Comercial, 3=Prestação de serviços, 4=Construção civil, 5=Produtor rural
    
    # Regime tributário
    codigo_regime_tributario = Column(String(1), default="1")  # 1=Simples Nacional, 2=Simples Nacional - excesso de sublimite de receita bruta, 3=Regime Normal
    
    # Informações bancárias
    codigo_banco = Column(String(10))
    agencia = Column(String(10))
    conta_corrente = Column(String(20))
    doc_titular = Column(String(18))
    nome_titular = Column(String(100))
    
    # Observações
    observacoes = Column(Text)
    
    # Status
    inativo = Column(String(1), default="N")  # S/N
    bloqueado = Column(String(1), default="N")  # S/N
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Integracao(Base):
    __tablename__ = "integracoes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)  # Nome da integração (ex: "Omie", "ContaAzul", etc.)
    tipo = Column(String(50), nullable=False)  # Tipo da integração (ex: "ERP", "CRM", "Financeiro")
    descricao = Column(Text)
    
    # Configurações da API
    base_url = Column(String(255))  # URL base da API
    app_key = Column(String(255))  # Chave da aplicação
    app_secret = Column(String(255))  # Segredo da aplicação
    token = Column(String(500))  # Token de acesso (se aplicável)
    
    # Configurações adicionais (JSON para flexibilidade)
    configuracoes_extras = Column(JSON)  # Para configurações específicas de cada integração
    
    # Status e controle
    ativo = Column(Boolean, default=True)
    testado = Column(Boolean, default=False)  # Se a conexão foi testada com sucesso
    ultima_sincronizacao = Column(DateTime)  # Última vez que sincronizou dados
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== SCHEMAS ====================

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class BancoCreate(BaseModel):
    codigo: str
    nome: str
    nome_fantasia: Optional[str] = None
    site: Optional[str] = None
    ativo: bool = True

class BancoUpdate(BaseModel):
    nome: Optional[str] = None
    nome_fantasia: Optional[str] = None
    site: Optional[str] = None
    ativo: Optional[bool] = None

class CategoriaCreate(BaseModel):
    codigo: str
    nome: str
    descricao: Optional[str] = None
    tipo: str
    categoria_pai_id: Optional[int] = None
    ativo: bool = True

class CentroCustoCreate(BaseModel):
    codigo: str
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

class ClienteCreate(BaseModel):
    codigo: str
    nome: str
    nome_fantasia: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    ativo: bool = True

class FornecedorCreate(BaseModel):
    codigo: str
    nome: str
    nome_fantasia: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    ativo: bool = True

class FormaPagamentoCreate(BaseModel):
    codigo: str
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

class PlanoContasCreate(BaseModel):
    codigo: str
    nome: str
    tipo: str
    conta_pai_id: Optional[int] = None
    ativo: bool = True

class ContaPagarCreate(BaseModel):
    descricao: str
    fornecedor_id: int
    categoria_id: Optional[int] = None
    centro_custo_id: Optional[int] = None
    forma_pagamento_id: Optional[int] = None
    valor: float
    data_vencimento: str
    observacoes: Optional[str] = None

class ContaReceberCreate(BaseModel):
    descricao: str
    cliente_id: int
    categoria_id: Optional[int] = None
    centro_custo_id: Optional[int] = None
    forma_pagamento_id: Optional[int] = None
    valor: float
    data_vencimento: str
    observacoes: Optional[str] = None

# ==================== DEPENDENCIES ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user

# ==================== DATABASE SETUP ====================

def create_tables():
    """Criar todas as tabelas"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("🗃️ Tabelas criadas/verificadas com sucesso!")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        return False

def create_default_users():
    """Criar usuários padrão"""
    db = SessionLocal()
    try:
        # Verificar se já existem usuários
        if db.query(User).count() > 0:
            logger.info("👤 Usuários já existem no banco")
            return
            
        logger.info("👤 Criando usuários padrão...")
        
        users_to_create = [
            ("admin@example.com", "Administrador do Sistema", "changethis", True),
            ("financeiro@example.com", "Elon Alb", "fin123", False),
            ("user@example.com", "Maria Silva", "user123", False),
        ]
        
        for email, name, password, is_superuser in users_to_create:
            user = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(password),
                is_active=True,
                is_superuser=is_superuser
            )
            db.add(user)
        
        db.commit()
        logger.info("✅ Usuários padrão criados!")
        
    except Exception as e:
        logger.error(f"⚠️ Erro ao criar usuários padrão: {e}")
        db.rollback()
    finally:
        db.close()

# Inicializar banco de dados
if create_tables():
    create_default_users()

# ==================== FASTAPI APP ====================

app = FastAPI(
    title="ERP Claude - Backend API",
    description="Sistema ERP desenvolvido com Claude AI",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4201",
        "http://0.0.0.0:4200",
        "https://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ROUTES ====================

@app.get("/")
async def root():
    return {
        "message": "🚀 ERP Claude Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==================== AUTH ROUTES ====================

@app.post("/api/v1/auth/login", response_model=Token)
async def login_for_access_token(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == username).first()
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_superuser": user.is_superuser
        }
    }

@app.get("/api/v1/users/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_superuser": current_user.is_superuser
    }

# ==================== BANCOS ROUTES ====================

@app.get("/api/v1/bancos")
async def get_bancos(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Banco)
    
    if search:
        query = query.filter(
            (Banco.codigo.ilike(f"%{search}%")) | 
            (Banco.nome.ilike(f"%{search}%"))
        )
    
    total = query.count()
    bancos = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": bancos,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@app.post("/api/v1/bancos")
async def create_banco(
    banco: BancoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if db.query(Banco).filter(Banco.codigo == banco.codigo).first():
        raise HTTPException(status_code=400, detail="Código já existe")
    
    db_banco = Banco(**banco.dict())
    db.add(db_banco)
    db.commit()
    db.refresh(db_banco)
    return db_banco

@app.put("/api/v1/bancos/{banco_id}")
async def update_banco(
    banco_id: int,
    banco: BancoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_banco = db.query(Banco).filter(Banco.id == banco_id).first()
    if not db_banco:
        raise HTTPException(status_code=404, detail="Banco não encontrado")
    
    for field, value in banco.dict(exclude_unset=True).items():
        setattr(db_banco, field, value)
    
    db.commit()
    db.refresh(db_banco)
    return db_banco

@app.delete("/api/v1/bancos/{banco_id}")
async def delete_banco(
    banco_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_banco = db.query(Banco).filter(Banco.id == banco_id).first()
    if not db_banco:
        raise HTTPException(status_code=404, detail="Banco não encontrado")
    
    db.delete(db_banco)
    db.commit()
    return {"message": "Banco excluído com sucesso"}

# ==================== CONTAS A PAGAR ROUTES ====================

@app.get("/api/v1/contas-pagar")
async def get_contas_pagar(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ContaPagar)
    
    if search:
        query = query.filter(ContaPagar.descricao.ilike(f"%{search}%"))
    
    if status:
        query = query.filter(ContaPagar.status == status)
    
    total = query.count()
    contas = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": contas,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@app.post("/api/v1/contas-pagar")
async def create_conta_pagar(
    conta: ContaPagarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_conta = ContaPagar(**conta.dict())
    db.add(db_conta)
    db.commit()
    db.refresh(db_conta)
    return db_conta

# ==================== INTEGRACOES ROUTES ====================

# Schemas para Integrações
class IntegracaoCreate(BaseModel):
    nome: str
    tipo: str
    descricao: Optional[str] = None
    base_url: Optional[str] = None
    app_key: Optional[str] = None
    app_secret: Optional[str] = None
    token: Optional[str] = None
    configuracoes_extras: Optional[Dict[str, Any]] = None
    ativo: bool = True

class IntegracaoUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    descricao: Optional[str] = None
    base_url: Optional[str] = None
    app_key: Optional[str] = None
    app_secret: Optional[str] = None
    token: Optional[str] = None
    configuracoes_extras: Optional[Dict[str, Any]] = None
    ativo: Optional[bool] = None

@app.get("/api/v1/integracoes")
async def get_integracoes(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tipo: Optional[str] = None,
    ativo_apenas: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Integracao)
    
    if ativo_apenas:
        query = query.filter(Integracao.ativo == True)
    
    if tipo:
        query = query.filter(Integracao.tipo == tipo)
    
    if search:
        query = query.filter(
            (Integracao.nome.ilike(f"%{search}%")) |
            (Integracao.descricao.ilike(f"%{search}%")) |
            (Integracao.tipo.ilike(f"%{search}%"))
        )
    
    total = query.count()
    integracoes = query.offset(skip).limit(limit).all()
    
    # Converter para formato público (sem dados sensíveis)
    items_public = []
    for item in integracoes:
        item_dict = {
            "id": item.id,
            "nome": item.nome,
            "tipo": item.tipo,
            "descricao": item.descricao,
            "base_url": item.base_url,
            "ativo": item.ativo,
            "testado": item.testado,
            "ultima_sincronizacao": item.ultima_sincronizacao.isoformat() if item.ultima_sincronizacao else None,
            "created_at": item.created_at.isoformat(),
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        }
        items_public.append(item_dict)
    
    return {
        "items": items_public,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@app.post("/api/v1/integracoes")
async def create_integracao(
    integracao: IntegracaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar se nome já existe
    existing = db.query(Integracao).filter(Integracao.nome == integracao.nome).first()
    if existing:
        raise HTTPException(status_code=400, detail="Nome da integração já existe no sistema")
    
    db_integracao = Integracao(**integracao.dict())
    db.add(db_integracao)
    db.commit()
    db.refresh(db_integracao)
    
    return {
        "id": db_integracao.id,
        "nome": db_integracao.nome,
        "tipo": db_integracao.tipo,
        "descricao": db_integracao.descricao,
        "base_url": db_integracao.base_url,
        "ativo": db_integracao.ativo,
        "testado": db_integracao.testado,
        "ultima_sincronizacao": db_integracao.ultima_sincronizacao.isoformat() if db_integracao.ultima_sincronizacao else None,
        "created_at": db_integracao.created_at.isoformat(),
        "updated_at": db_integracao.updated_at.isoformat() if db_integracao.updated_at else None
    }

@app.get("/api/v1/integracoes/{id}")
async def get_integracao(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    integracao = db.query(Integracao).filter(Integracao.id == id).first()
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    # Retornar dados completos apenas para superusuários
    if current_user.is_superuser:
        return {
            "id": integracao.id,
            "nome": integracao.nome,
            "tipo": integracao.tipo,
            "descricao": integracao.descricao,
            "base_url": integracao.base_url,
            "app_key": integracao.app_key,
            "app_secret": integracao.app_secret,
            "token": integracao.token,
            "configuracoes_extras": integracao.configuracoes_extras,
            "ativo": integracao.ativo,
            "testado": integracao.testado,
            "ultima_sincronizacao": integracao.ultima_sincronizacao.isoformat() if integracao.ultima_sincronizacao else None,
            "created_at": integracao.created_at.isoformat(),
            "updated_at": integracao.updated_at.isoformat() if integracao.updated_at else None
        }
    else:
        return {
            "id": integracao.id,
            "nome": integracao.nome,
            "tipo": integracao.tipo,
            "descricao": integracao.descricao,
            "base_url": integracao.base_url,
            "ativo": integracao.ativo,
            "testado": integracao.testado,
            "ultima_sincronizacao": integracao.ultima_sincronizacao.isoformat() if integracao.ultima_sincronizacao else None,
            "created_at": integracao.created_at.isoformat(),
            "updated_at": integracao.updated_at.isoformat() if integracao.updated_at else None
        }

@app.put("/api/v1/integracoes/{id}")
async def update_integracao(
    id: int,
    integracao: IntegracaoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_integracao = db.query(Integracao).filter(Integracao.id == id).first()
    if not db_integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    # Verificar se nome já existe em outra integração
    if integracao.nome and integracao.nome != db_integracao.nome:
        existing = db.query(Integracao).filter(Integracao.nome == integracao.nome).first()
        if existing and existing.id != id:
            raise HTTPException(status_code=400, detail="Nome da integração já existe em outra integração")
    
    for field, value in integracao.dict(exclude_unset=True).items():
        setattr(db_integracao, field, value)
    
    db.commit()
    db.refresh(db_integracao)
    
    return {
        "id": db_integracao.id,
        "nome": db_integracao.nome,
        "tipo": db_integracao.tipo,
        "descricao": db_integracao.descricao,
        "base_url": db_integracao.base_url,
        "ativo": db_integracao.ativo,
        "testado": db_integracao.testado,
        "ultima_sincronizacao": db_integracao.ultima_sincronizacao.isoformat() if db_integracao.ultima_sincronizacao else None,
        "created_at": db_integracao.created_at.isoformat(),
        "updated_at": db_integracao.updated_at.isoformat() if db_integracao.updated_at else None
    }

@app.delete("/api/v1/integracoes/{id}")
async def delete_integracao(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    integracao = db.query(Integracao).filter(Integracao.id == id).first()
    if not integracao:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    db.delete(integracao)
    db.commit()
    return {"message": "Integração excluída com sucesso"}

@app.get("/api/v1/integracoes/tipos/disponiveis")
async def get_tipos_integracoes(
    current_user: User = Depends(get_current_user)
):
    return {
        "tipos": [
            {"codigo": "ERP", "nome": "Sistema ERP", "descricao": "Sistemas de gestão empresarial"},
            {"codigo": "CRM", "nome": "Sistema CRM", "descricao": "Sistemas de relacionamento com cliente"},
            {"codigo": "Financeiro", "nome": "Sistema Financeiro", "descricao": "Sistemas de gestão financeira"},
            {"codigo": "E-commerce", "nome": "E-commerce", "descricao": "Plataformas de comércio eletrônico"},
            {"codigo": "Contabil", "nome": "Sistema Contábil", "descricao": "Sistemas de contabilidade"},
        ]
    }

# ==================== EMPRESAS ROUTES ====================

# Schemas para Empresas
class EmpresaCreate(BaseModel):
    codigo_cliente_omie: Optional[int] = None
    codigo_cliente_integracao: Optional[str] = None
    razao_social: str
    nome_fantasia: Optional[str] = None
    cnpj: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    endereco: Optional[str] = None
    endereco_numero: Optional[str] = None
    bairro: Optional[str] = None
    complemento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    telefone1_ddd: Optional[str] = None
    telefone1_numero: Optional[str] = None
    telefone2_ddd: Optional[str] = None
    telefone2_numero: Optional[str] = None
    email: Optional[str] = None
    homepage: Optional[str] = None
    observacoes: Optional[str] = None
    inativo: str = "N"
    bloqueado: str = "N"

class EmpresaUpdate(BaseModel):
    codigo_cliente_omie: Optional[int] = None
    codigo_cliente_integracao: Optional[str] = None
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    cnpj: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    endereco: Optional[str] = None
    endereco_numero: Optional[str] = None
    bairro: Optional[str] = None
    complemento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    telefone1_ddd: Optional[str] = None
    telefone1_numero: Optional[str] = None
    telefone2_ddd: Optional[str] = None
    telefone2_numero: Optional[str] = None
    email: Optional[str] = None
    homepage: Optional[str] = None
    observacoes: Optional[str] = None
    inativo: Optional[str] = None
    bloqueado: Optional[str] = None

@app.get("/api/v1/empresas")
async def get_empresas(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    ativo_apenas: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Empresa)
    
    if ativo_apenas:
        query = query.filter(Empresa.inativo == "N")
    
    if search:
        query = query.filter(
            (Empresa.razao_social.ilike(f"%{search}%")) |
            (Empresa.nome_fantasia.ilike(f"%{search}%")) |
            (Empresa.cnpj.ilike(f"%{search}%"))
        )
    
    total = query.count()
    empresas = query.offset(skip).limit(limit).all()
    
    return {
        "items": empresas,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@app.post("/api/v1/empresas")
async def create_empresa(
    empresa: EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar se CNPJ já existe
    if empresa.cnpj:
        existing = db.query(Empresa).filter(Empresa.cnpj == empresa.cnpj).first()
        if existing:
            raise HTTPException(status_code=400, detail="CNPJ já cadastrado no sistema")
    
    # Verificar se código de integração já existe
    if empresa.codigo_cliente_integracao:
        existing = db.query(Empresa).filter(Empresa.codigo_cliente_integracao == empresa.codigo_cliente_integracao).first()
        if existing:
            raise HTTPException(status_code=400, detail="Código de integração já cadastrado no sistema")
    
    db_empresa = Empresa(**empresa.dict())
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@app.get("/api/v1/empresas/{id}")
async def get_empresa(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    empresa = db.query(Empresa).filter(Empresa.id == id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa

@app.put("/api/v1/empresas/{id}")
async def update_empresa(
    id: int,
    empresa: EmpresaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_empresa = db.query(Empresa).filter(Empresa.id == id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    # Verificar se CNPJ já existe em outra empresa
    if empresa.cnpj and empresa.cnpj != db_empresa.cnpj:
        existing = db.query(Empresa).filter(Empresa.cnpj == empresa.cnpj).first()
        if existing and existing.id != id:
            raise HTTPException(status_code=400, detail="CNPJ já cadastrado em outra empresa")
    
    for field, value in empresa.dict(exclude_unset=True).items():
        setattr(db_empresa, field, value)
    
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@app.delete("/api/v1/empresas/{id}")
async def delete_empresa(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    empresa = db.query(Empresa).filter(Empresa.id == id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    db.delete(empresa)
    db.commit()
    return {"message": "Empresa excluída com sucesso"}

# ==================== INCLUDE ROUTERS ====================

# Import and include API routers
try:
    from app.api.v1.api import api_router
    app.include_router(api_router, prefix="/api/v1")
    logger.info("✅ API routers incluídos com sucesso!")
except ImportError as e:
    logger.warning(f"⚠️ Não foi possível importar routers da API: {e}")
    logger.info("📝 Usando rotas básicas do main.py")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
