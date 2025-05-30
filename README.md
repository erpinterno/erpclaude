# ERP Claude

Sistema ERP completo com módulos financeiros, desenvolvido com tecnologias modernas.

## 🚀 Tecnologias

- **Backend**: FastAPI (Python)
- **Frontend**: Angular 17
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Containerização**: Docker

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento)
- Python 3.11+ (para desenvolvimento)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/erpinterno/erpclaude.git
cd erpclaude
```

2. Configure as variáveis de ambiente:
```bash
cp backend/.env.example backend/.env
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Acesse:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🏗️ Estrutura do Projeto

```
erpclaude/
├── backend/          # API FastAPI
├── frontend/         # Aplicação Angular
├── docker-compose.yml
└── README.md
```

## 📦 Módulos

### Financeiro
- ✅ Contas a Pagar
- ✅ Contas a Receber
- ✅ Importação/Exportação Excel
- ✅ Conta Corrente

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.