#!/bin/bash

# 🎨 Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando processo de commit...${NC}"

# Detectar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📌 Branch atual: $CURRENT_BRANCH${NC}"

# Verificar se há mudanças
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}✨ Nenhuma mudança para commitar${NC}"
    exit 0
fi

# Mostrar arquivos modificados
echo -e "${GREEN}📋 Arquivos modificados:${NC}"
git status -s

# Adicionar todos os arquivos
echo -e "${GREEN}📦 Adicionando arquivos...${NC}"
git add .

# Fazer commit com data
COMMIT_MSG="fix: atualizações do ERP - $(date +%Y-%m-%d)"
echo -e "${GREEN}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MSG"

# Verificar se o remote existe
if ! git remote get-url origin &> /dev/null; then
    echo -e "${RED}❌ Remote 'origin' não configurado${NC}"
    echo -e "${YELLOW}💡 Configure com: git remote add origin https://github.com/erpinterno/erpclaude${NC}"
    exit 1
fi

# Fazer push para o branch atual
echo -e "${GREEN}📤 Enviando para GitHub (branch: $CURRENT_BRANCH)...${NC}"
if git push origin $CURRENT_BRANCH; then
    echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao enviar para GitHub${NC}"
    
    # Tentar criar o branch remoto se não existir
    echo -e "${YELLOW}🔄 Tentando criar branch remoto...${NC}"
    if git push -u origin $CURRENT_BRANCH; then
        echo -e "${GREEN}✅ Branch remoto criado e push realizado!${NC}"
    else
        echo -e "${RED}❌ Falha ao criar branch remoto${NC}"
        echo -e "${YELLOW}💡 Dicas:${NC}"
        echo -e "  1. Verifique suas credenciais do GitHub"
        echo -e "  2. Configure um Personal Access Token"
        echo -e "  3. Verifique se o repositório existe: https://github.com/erpinterno/erpclaude"
        echo -e "  4. Se necessário, faça login com: gh auth login"
    fi
fi

# Mostrar status final
echo -e "${GREEN}📊 Status final:${NC}"
git status --short --branch