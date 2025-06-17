#!/usr/bin/env python3
import requests
import json

# URL base da API
BASE_URL = "http://localhost:8000/api/v1"

def test_login():
    """Testar login"""
    print("🔑 Testando login...")
    
    # Dados de login
    login_data = {
        "username": "admin@example.com",
        "password": "changethis"
    }
    
    # Fazer login
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data=login_data
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        print(f"✅ Login bem-sucedido!")
        print(f"Token (primeiros 50 chars): {token[:50]}...")
        return token
    else:
        print(f"❌ Erro no login: {response.text}")
        return None

def test_integracoes(token):
    """Testar endpoint de integrações"""
    print("\n🔗 Testando endpoint de integrações...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{BASE_URL}/integracoes/",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Endpoint de integrações funcionando!")
        return True
    else:
        print(f"❌ Erro no endpoint de integrações: {response.text}")
        return False

def test_tipos_disponiveis(token):
    """Testar endpoint de tipos disponíveis"""
    print("\n📋 Testando endpoint de tipos disponíveis...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{BASE_URL}/integracoes/tipos/disponiveis",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Endpoint de tipos disponíveis funcionando!")
        return True
    else:
        print(f"❌ Erro no endpoint de tipos disponíveis: {response.text}")
        return False

if __name__ == "__main__":
    print("🧪 Testando autenticação do ERP Claude\n")
    
    # Testar login
    token = test_login()
    
    if token:
        # Testar endpoints que requerem autenticação
        test_integracoes(token)
        test_tipos_disponiveis(token)
    
    print("\n✅ Teste concluído!")