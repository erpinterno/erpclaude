# backend/main.py
import time
import sys
import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurações
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# URL do banco de dados - suporta diferentes ambientes
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://erp_user:erp_password@postgres:5432/erp_db"
)

logger.info(f"🔗 Database URL: {DATABASE_URL}")

# SQLAlchemy setup
engine = create_engine(
    DATABASE_URL, 
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300
)
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

class Banco(Base):
    __tablename__ = "bancos"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(3), unique=True, index=True, nullable=False)
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
    categoria_pai_id = Column(Integer)
    ativo = Column(Boolean, default=True)
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
    nome_fantasia: str = None
    site: str = None
    ativo: bool = True

class CategoriaCreate(BaseModel):
    codigo: str
    nome: str
    descricao: str = None
    tipo: str
    categoria_pai_id: int = None
    ativo: bool = True

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

# ==================== DATABASE SETUP - CORRIGIDO ====================
def test_connection():
    """Testa a conexão com o banco de dados"""
    try:
        with engine.connect() as connection:
            # Usar text() para SQLAlchemy 2.x
            result = connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"❌ Erro na conexão: {e}")
        return False

def wait_for_database(max_retries=30):
    """Aguarda o banco de dados ficar disponível"""
    retries = 0
    while retries < max_retries:
        logger.info(f"🔄 Tentativa {retries + 1}/{max_retries} de conexão com o banco...")
        
        if test_connection():
            logger.info("✅ Banco de dados conectado!")
            return True
        
        retries += 1
        if retries < max_retries:
            logger.info("⏳ Aguardando 2 segundos...")
            time.sleep(2)
    
    logger.error("❌ Não foi possível conectar ao banco de dados!")
    return False

# Aguardar banco estar disponível
if not wait_for_database():
    logger.error("🚨 Falha crítica: Banco de dados não disponível. Saindo...")
    sys.exit(1)

# Criar tabelas
try:
    Base.metadata.create_all(bind=engine)
    logger.info("🗃️ Tabelas criadas/verificadas com sucesso!")
except Exception as e:
    logger.error(f"❌ Erro ao criar tabelas: {e}")
    sys.exit(1)

# ==================== FASTAPI APP ====================
app = FastAPI(
    title="ERP Claude - Backend API",
    description="Sistema ERP desenvolvido com Claude AI",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - Configuração para permitir o frontend Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://0.0.0.0:4200",
        "https://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== STARTUP EVENT ====================
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        # Criar usuário admin padrão se não existir
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
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
    try:
        # Usar a função de teste corrigida
        db_connected = test_connection()
        return {
            "status": "healthy" if db_connected else "unhealthy",
            "database": "connected" if db_connected else "disconnected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# ==================== AUTH ROUTES ====================
@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
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

@app.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_superuser": current_user.is_superuser
    }

# ==================== BANCOS ROUTES ====================
@app.get("/bancos")
async def get_bancos(
    page: int = 1,
    limit: int = 10,
    search: str = None,
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

@app.post("/bancos")
async def create_banco(
    banco: BancoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar se código já existe
    if db.query(Banco).filter(Banco.codigo == banco.codigo).first():
        raise HTTPException(status_code=400, detail="Código já existe")
    
    db_banco = Banco(**banco.dict())
    db.add(db_banco)
    db.commit()
    db.refresh(db_banco)
    return db_banco

# ==================== CATEGORIAS ROUTES ====================
@app.get("/categorias")
async def get_categorias(
    page: int = 1,
    limit: int = 10,
    search: str = None,
    tipo: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Categoria)
    
    if search:
        query = query.filter(
            (Categoria.codigo.ilike(f"%{search}%")) | 
            (Categoria.nome.ilike(f"%{search}%"))
        )
    
    if tipo:
        query = query.filter(Categoria.tipo == tipo)
    
    total = query.count()
    categorias = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": categorias,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@app.post("/categorias")
async def create_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar se código já existe
    if db.query(Categoria).filter(Categoria.codigo == categoria.codigo).first():
        raise HTTPException(status_code=400, detail="Código já existe")
    
    db_categoria = Categoria(**categoria.dict())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)