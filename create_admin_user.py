#!/usr/bin/env python3
"""
Script simples para criar usuário admin
"""
import sys
import os

# Adicionar o path do backend
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.db.session import SessionLocal
from backend.app.models.user import User
from backend.app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Verificar se já existe usuário admin
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if admin:
            print(f"✅ Usuário admin já existe: {admin.email}")
            print(f"   Ativo: {admin.is_active}")
            print(f"   Super: {admin.is_superuser}")
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
        print(f"   Email: {admin_user.email}")
        print(f"   ID: {admin_user.id}")
        print(f"   Senha: admin123")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()