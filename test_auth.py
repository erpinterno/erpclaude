#!/usr/bin/env python3
"""
Script de teste para verificar autenticação da API
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_auth():
    print("=== Teste de Autenticação da API ===\n")
    
    # 1. Testar se o servidor está rodando
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Servidor está rodando: {response.status_code}")
        print(f"   Resposta: {response.json()}\n")
    except Exception as e:
        print(f"❌ Erro ao conectar com o servidor: {e}")
        return
    
    # 2. Testar login
    print("2. Testando login...")
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        # Testar login com FormData (como o frontend faz)
        form_data = {
            "username": login_data["username"],
            "password": login_data["password"],
            "grant_type": "password"
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=form_data)
        print(f"   Status do login: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"   ✅ Login bem-sucedido")
            print(f"   Token type: {token_data.get('token_type')}")
            token = token_data.get('access_token')
            print(f"   Token (primeiros 50 chars): {token[:50]}...\n")
            
            # 3. Testar requisição autenticada
            print("3. Testando requisição autenticada...")
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Testar GET de integrações
            response = requests.get(f"{BASE_URL}/api/v1/integracoes", headers=headers)
            print(f"   Status GET integrações: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ Requisição autenticada bem-sucedida")
                data = response.json()
                print(f"   Total de integrações: {data.get('total', 0)}\n")
                
                # 4. Testar POST de integração
                print("4. Testando criação de integração...")
                test_integration = {
                    "nome": "Teste Integração " + str(int(time.time())),
                    "tipo": "API",
                    "tipo_requisicao": "GET",
                    "tipo_importacao": "INCREMENTAL",
                    "descricao": "Integração de teste",
                    "base_url": "https://api.exemplo.com",
                    "metodo_integracao": "test",
                    "ativo": True
                }
                
                response = requests.post(
                    f"{BASE_URL}/api/v1/integracoes", 
                    headers=headers, 
                    json=test_integration
                )
                print(f"   Status POST integração: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"   ✅ Integração criada com sucesso")
                    created = response.json()
                    print(f"   ID da integração: {created.get('id')}")
                else:
                    print(f"   ❌ Erro ao criar integração: {response.text}")
            else:
                print(f"   ❌ Erro na requisição autenticada: {response.text}")
        else:
            print(f"   ❌ Erro no login: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")

if __name__ == "__main__":
    import time
    test_auth()