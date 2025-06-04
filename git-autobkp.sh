#!/bin/bash

# ===============================================
# Script Rápido Git - ERP Claude
# Uso: ./git-quick.sh "mensagem do commit"
# ===============================================

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navegar para o diretório do projeto
cd /workspaces/erpclaude 2>/dev/null || {
    echo -e "${RED}❌ Erro: Diretório do projeto não encontrado!${NC}"
    exit 1
}

# Mensagem do commit
if [ -z "$1" ]; then
    COMMIT_MSG="fix: atualizações do ERP - $(date +%Y-%m-%d)"
else
    COMMIT_MSG="$1"
fi

echo -e "${YELLOW}🚀 Iniciando processo de commit...${NC}"

# Mostrar status
echo -e "\n${YELLOW}📋 Arquivos modificados:${NC}"
git status --short

# Adicionar todos os arquivos
echo -e "\n${YELLOW}📦 Adicionando arquivos...${NC}"
git add .

# Fazer commit
echo -e "\n${YELLOW}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MSG"

# Push para origin
echo -e "\n${YELLOW}📤 Enviando para GitHub...${NC}"
git push origin main

# Verificar sucesso
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Sucesso! Alterações enviadas para GitHub${NC}"
    echo -e "${GREEN}🔗 Ver no GitHub: https://github.com/erpinterno/erpclaude${NC}"
else
    echo -e "\n${RED}❌ Erro ao enviar para GitHub${NC}"
    echo -e "${YELLOW}💡 Dica: Verifique suas credenciais ou use um Personal Access Token${NC}"
fi