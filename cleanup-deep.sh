#!/bin/bash

# 🎨 Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔════════════════════════════════════════╗${NC}"
echo -e "${RED}║   🧹 LIMPEZA PROFUNDA DO CODESPACE    ║${NC}"
echo -e "${RED}╚════════════════════════════════════════╝${NC}"

# Mostrar uso atual
echo -e "\n${YELLOW}📊 Uso atual do disco:${NC}"
df -h | grep -E "Filesystem|overlay|/dev/root"

# Função para mostrar progresso
show_progress() {
    echo -e "${BLUE}► $1${NC}"
}

# Função para mostrar espaço liberado
show_freed() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo -e "\n${YELLOW}🚀 Iniciando limpeza...${NC}\n"

# 1. LIMPAR CACHE DO APT (Sistema)
show_progress "Limpando cache do APT..."
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove -y
show_freed "Cache do APT limpo"

# 2. LIMPAR LOGS DO SISTEMA
show_progress "Limpando logs do sistema..."
sudo journalctl --vacuum-time=1h
sudo find /var/log -type f -name "*.log" -exec truncate -s 0 {} \;
sudo rm -rf /var/log/*.gz
sudo rm -rf /var/log/*.1
show_freed "Logs do sistema limpos"

# 3. LIMPAR DIRETÓRIO /tmp
show_progress "Limpando diretório temporário..."
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
show_freed "Diretórios temporários limpos"

# 4. LIMPAR DOCKER (se existir)
if command -v docker &> /dev/null; then
    show_progress "Limpando Docker..."
    docker system prune -a -f --volumes 2>/dev/null || true
    docker builder prune -a -f 2>/dev/null || true
    sudo rm -rf /var/lib/docker/tmp/* 2>/dev/null || true
    show_freed "Docker limpo"
fi

# 5. LIMPAR PROJETO ERP
show_progress "Limpando projeto ERP..."
cd /workspaces/erpclaude 2>/dev/null || cd /workspace/erpclaude 2>/dev/null

# Frontend - Angular
if [ -d "frontend" ]; then
    show_progress "Limpando Frontend Angular..."
    cd frontend
    rm -rf node_modules
    rm -rf dist
    rm -rf .angular
    rm -rf .cache
    rm -rf coverage
    rm -f package-lock.json
    npm cache clean --force 2>/dev/null || true
    cd ..
    show_freed "Frontend limpo"
fi

# Backend - Python
if [ -d "backend" ]; then
    show_progress "Limpando Backend Python..."
    cd backend
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name "*.pyo" -delete 2>/dev/null || true
    rm -rf .pytest_cache 2>/dev/null || true
    rm -rf venv .venv env 2>/dev/null || true
    rm -rf build dist *.egg-info 2>/dev/null || true
    pip cache purge 2>/dev/null || true
    cd ..
    show_freed "Backend limpo"
fi

# 6. LIMPAR GIT
show_progress "Otimizando repositório Git..."
git gc --aggressive --prune=now 2>/dev/null || true
git repack -a -d --depth=250 --window=250 2>/dev/null || true
show_freed "Git otimizado"

# 7. LIMPAR CACHE DO HOME
show_progress "Limpando cache do usuário..."
rm -rf ~/.cache/*
rm -rf ~/.npm
rm -rf ~/.node-gyp
rm -rf ~/.pip
rm -rf ~/.local/share/Trash/*
show_freed "Cache do usuário limpo"

# 8. ENCONTRAR E REMOVER ARQUIVOS GRANDES DESNECESSÁRIOS
show_progress "Procurando arquivos grandes..."
# Remover arquivos de log grandes
find /workspaces -name "*.log" -size +10M -delete 2>/dev/null || true
# Remover arquivos core dump
find /workspaces -name "core.*" -delete 2>/dev/null || true
# Remover arquivos .old
find /workspaces -name "*.old" -delete 2>/dev/null || true
show_freed "Arquivos grandes removidos"

# 9. LIMPAR SNAPS ANTIGOS (se existir)
if command -v snap &> /dev/null; then
    show_progress "Limpando Snaps antigos..."
    sudo bash -c 'snap list --all | awk "/disabled/{print \$1, \$3}" | while read name rev; do snap remove "$name" --revision="$rev"; done' 2>/dev/null || true
    show_freed "Snaps limpos"
fi

# 10. LIMPAR CACHE DE LINGUAGENS
show_progress "Limpando cache de linguagens..."
# Ruby
rm -rf ~/.gem 2>/dev/null || true
# Go
rm -rf ~/go/pkg/mod/cache 2>/dev/null || true
# Rust
rm -rf ~/.cargo/registry/cache 2>/dev/null || true
# Java
rm -rf ~/.m2/repository 2>/dev/null || true
show_freed "Cache de linguagens limpo"

echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ LIMPEZA CONCLUÍDA!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}\n"

# Mostrar resultado final
echo -e "${YELLOW}📊 Uso após limpeza:${NC}"
df -h | grep -E "Filesystem|overlay|/dev/root"

# Calcular espaço liberado
echo -e "\n${YELLOW}💾 Espaço em /workspaces:${NC}"
df -h /workspaces

# Sugestões adicionais
echo -e "\n${YELLOW}💡 Sugestões adicionais:${NC}"
echo -e "1. Faça commit e push das alterações importantes"
echo -e "2. Delete branches locais não utilizados: ${BLUE}git branch -d <branch>${NC}"
echo -e "3. Se o problema persistir, considere recriar o Codespace"
echo -e "4. Para uma limpeza ainda mais agressiva, execute:"
echo -e "   ${BLUE}sudo find / -type f -size +100M 2>/dev/null | head -20${NC}"

# Criar alias para limpeza rápida
echo -e "\n${YELLOW}🔧 Criando alias para limpeza rápida...${NC}"
echo "alias cleanup='bash $(pwd)/cleanup-deep.sh'" >> ~/.bashrc
echo -e "${GREEN}✓ Use 'cleanup' para executar este script novamente${NC}"

#chmod +x cleanup-deep.sh
#./cleanup-deep.sh
