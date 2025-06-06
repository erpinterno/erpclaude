#!/usr/bin/env python3
"""
Script para testar login passo a passo
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.crud.crud_user import crud_user

def test_login():
    db = SessionLocal()
    try:
        print("🔍 Testando autenticação passo a passo...")
        
        # 1. Verificar se usuário existe
        user = crud_user.get_by_email(db, email="admin@example.com")
        if not user:
            print("❌ Usuário não encontrado")
            return False
        
        print(f"✅ Usuário encontrado: {user.email}")
        print(f"   ID: {user.id}")
        print(f"   Nome: {user.full_name}")
        print(f"   Ativo: {user.is_active}")
        print(f"   Super: {user.is_superuser}")
        print(f"   Hash: {user.hashed_password[:50]}...")
        
        # 2. Testar verificação de senha
        password = "admin123"
        print(f"\n🔐 Testando senha: {password}")
        
        is_valid = verify_password(password, user.hashed_password)
        print(f"   Senha válida: {is_valid}")
        
        if not is_valid:
            print("❌ Senha inválida - Tentando recriar hash...")
            # Tentar recriar o hash
            new_hash = get_password_hash(password)
            print(f"   Novo hash: {new_hash[:50]}...")
            
            # Verificar novo hash
            is_valid_new = verify_password(password, new_hash)
            print(f"   Novo hash válido: {is_valid_new}")
            
            if is_valid_new:
                print("   Atualizando senha no banco...")
                user.hashed_password = new_hash
                db.commit()
                print("   ✅ Senha atualizada")
        
        # 3. Testar autenticação completa
        print(f"\n🔑 Testando autenticação completa...")
        auth_user = crud_user.authenticate(db, email="admin@example.com", password="admin123")
        
        if auth_user:
            print(f"✅ Autenticação bem-sucedida!")
            print(f"   Email: {auth_user.email}")
            print(f"   ID: {auth_user.id}")
            return True
        else:
            print("❌ Autenticação falhou")
            return False
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if test_login():
        print("\n🎉 Teste de autenticação passou!")
    else:
        print("\n💥 Teste de autenticação falhou!")