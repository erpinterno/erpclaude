#!/usr/bin/env python3
"""
Script para configurar banco de dados e criar usuário admin
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine
from app.db.session import Base
from app.models.user import User
from app.models.empresa import Empresa  
from app.models.integracao import Integracao
from app.models.financeiro import *  # Importar todos os modelos financeiros
from app.core.security import get_password_hash

def setup_database():
    print("🗃️ Criando tabelas do banco de dados...")
    try:
        # Criar todas as tabelas
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        
        # Criar usuário admin
        db = SessionLocal()
        try:
            # Verificar se já existe usuário admin
            admin = db.query(User).filter(User.email == "admin@example.com").first()
            if admin:
                print(f"✅ Usuário admin já existe: {admin.email}")
                return True
            
            # Criar usuário admin
            print("🔨 Criando usuário admin...")
            admin_user = User(
                email="admin@example.com",
                full_name="Administrador",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_superuser=True
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            print(f"✅ Usuário admin criado com sucesso!")
            print(f"   Email: admin@example.com")
            print(f"   Senha: admin123")
            print(f"   ID: {admin_user.id}")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao criar usuário: {e}")
            db.rollback()
            return False
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if setup_database():
        print("🎉 Banco de dados configurado com sucesso!")
    else:
        print("💥 Falha na configuração do banco de dados!")
        sys.exit(1)