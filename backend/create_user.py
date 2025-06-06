#!/usr/bin/env python3
"""
Script para criar usuário admin
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def main():
    db = SessionLocal()
    try:
        # Verificar se já existe usuário admin
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if admin:
            print(f"✅ Usuário admin já existe: {admin.email}")
            print(f"   Verificando senha...")
            from app.core.security import verify_password
            if verify_password("admin123", admin.hashed_password):
                print("   ✅ Senha correta")
            else:
                print("   ❌ Senha incorreta, atualizando...")
                admin.hashed_password = get_password_hash("admin123")
                db.commit()
                print("   ✅ Senha atualizada")
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
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    main()