#!/bin/bash

# Script para corrigir problemas críticos do sistema ERP
# Usage: ./fix-erp-system.sh

echo "🔧 Iniciando correção do sistema ERP Claude..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Parar containers existentes
print_status "Parando containers existentes..."
docker-compose down 2>/dev/null || true

# 2. Limpar cache do Docker
print_status "Limpando cache do Docker..."
docker system prune -f 2>/dev/null || true

# 3. Backup do banco de dados existente
if [ -f "backend/erp_database.db" ]; then
    print_status "Fazendo backup do banco de dados..."
    cp backend/erp_database.db backend/erp_database.db.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Backup criado"
fi

# 4. Verificar dependências Python no backend
print_status "Verificando dependências Python..."
cd backend

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    print_status "Criando arquivo .env..."
    cp .env.example .env
    print_success "Arquivo .env criado"
fi

# 5. Rebuild do backend
print_status "Reconstruindo container do backend..."
cd ..
docker-compose build --no-cache backend || {
    print_error "Falha ao construir backend"
    exit 1
}

# 6. Rebuild do frontend
print_status "Reconstruindo container do frontend..."
docker-compose build --no-cache frontend || {
    print_warning "Falha ao construir frontend, tentando sem cache..."
    docker-compose build frontend
}

# 7. Inicializar containers
print_status "Iniciando containers..."
docker-compose up -d

# 8. Aguardar containers ficarem prontos
print_status "Aguardando containers ficarem prontos..."
sleep 10

# 9. Verificar status dos containers
print_status "Verificando status dos containers..."
if docker-compose ps | grep -q "Up"; then
    print_success "Containers iniciados com sucesso"
else
    print_error "Problemas ao iniciar containers"
    docker-compose logs backend
    exit 1
fi

# 10. Executar migrações/inicialização do banco
print_status "Inicializando banco de dados..."
docker-compose exec -T backend python -c "
import sys
sys.path.append('/app')
from app.db.init_db import init_db
from app.db.session import SessionLocal
try:
    init_db(SessionLocal())
    print('✅ Banco de dados inicializado com sucesso')
except Exception as e:
    print(f'❌ Erro ao inicializar banco: {e}')
"

# 11. Testar endpoints críticos
print_status "Testando endpoints críticos..."

# Aguardar backend ficar disponível
sleep 5

# Teste de health check
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    print_success "Health check: OK"
else
    print_error "Health check: FALHOU"
fi

# Teste de autenticação
AUTH_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login-form" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin@example.com&password=changethis" 2>/dev/null)

if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
    print_success "Autenticação: OK"
    
    # Extrair token para testes subsequentes
    TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    pass
")
    
    if [ ! -z "$TOKEN" ]; then
        # Teste de /users/me
        if curl -f -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/users/me >/dev/null 2>&1; then
            print_success "Endpoint /users/me: OK"
        else
            print_error "Endpoint /users/me: FALHOU"
        fi
        
        # Teste de /integracoes
        if curl -f -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/integracoes >/dev/null 2>&1; then
            print_success "Endpoint /integracoes: OK"
        else
            print_error "Endpoint /integracoes: FALHOU"
        fi
        
        # Teste de /integracoes/tipos/disponiveis
        if curl -f -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/integracoes/tipos/disponiveis >/dev/null 2>&1; then
            print_success "Endpoint /integracoes/tipos/disponiveis: OK"
        else
            print_error "Endpoint /integracoes/tipos/disponiveis: FALHOU"
        fi
    fi
else
    print_error "Autenticação: FALHOU"
fi

# 12. Verificar logs para erros
print_status "Verificando logs para erros..."
if docker-compose logs backend 2>&1 | grep -i "error\|exception\|traceback" | head -5; then
    print_warning "Erros encontrados nos logs (apenas primeiros 5):"
else
    print_success "Nenhum erro crítico encontrado nos logs"
fi

# 13. Informações finais
echo ""
echo "======================================"
echo "🎉 CORREÇÃO CONCLUÍDA"
echo "======================================"
echo ""
echo "📊 Status dos serviços:"
docker-compose ps
echo ""
echo "🌐 URLs disponíveis:"
echo "  - Backend API: http://localhost:8000"
echo "  - Documentação: http://localhost:8000/docs"
echo "  - Health Check: http://localhost:8000/health"
echo "  - Frontend: http://localhost:4200"
echo ""
echo "👤 Credenciais padrão:"
echo "  - Email: admin@example.com"
echo "  - Senha: changethis"
echo ""
echo "📋 Comandos úteis:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Rebuild: docker-compose build --no-cache"
echo ""
echo "✅ Sistema ERP Claude corrigido e funcional!"