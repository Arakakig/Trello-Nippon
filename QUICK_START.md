# ⚡ Quick Start - Trello Nippon

Guia rápido para desenvolvedores experientes.

## 🏃 Início Rápido (5 minutos)

### 1. Pré-requisitos
- Node.js 18+
- MongoDB rodando (local ou Atlas)

### 2. Instalação Express

```bash
# Clone ou extraia o projeto
cd "Trello Nippon"

# Backend
cd backend
npm install
# Copie .env.example para .env e configure MONGODB_URI
npm run dev

# Frontend (novo terminal)
cd ../frontend
npm install
# Copie .env.local.example para .env.local
npm run dev
```

### 3. Acesso
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/health

### 4. Primeira Tarefa
1. Registre-se em /register
2. Crie uma tarefa
3. Arraste entre colunas no Kanban
4. Clique para abrir detalhes
5. Explore upload de arquivos e comentários

## 🎯 Comandos Úteis

```bash
# Instalar tudo de uma vez (da raiz do projeto)
npm run install:all

# Rodar apenas backend
npm run dev:backend

# Rodar apenas frontend
npm run dev:frontend

# Build para produção
cd frontend && npm run build && npm start
```

## 🐳 Docker (Opcional)

Se preferir usar Docker, crie um `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/trello-nippon
      - JWT_SECRET=seu_secret_aqui
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    depends_on:
      - backend

volumes:
  mongo-data:
```

Então:
```bash
docker-compose up
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trello-nippon
JWT_SECRET=change_this_to_a_random_secret
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔧 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Erro MongoDB | `net start MongoDB` (Windows) ou verifique se Atlas está configurado |
| Porta 3000 ocupada | `npm run dev -- -p 3001` |
| Erro CORS | Verifique NEXT_PUBLIC_API_URL |
| Erro 401 | Token expirou, faça logout/login |

## 🧪 Testar a API

```bash
# Health check
curl http://localhost:5000/api/health

# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## 📚 Estrutura do Código

```
backend/
├── models/         # Mongoose schemas
├── routes/         # Express routes
├── middleware/     # Auth & Upload
└── server.js       # Entry point

frontend/
├── src/
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   ├── store/          # Zustand stores
│   ├── lib/            # API client
│   └── types/          # TypeScript types
```

## 🎨 Tecnologias

**Backend**: Express + MongoDB + JWT + Multer
**Frontend**: Next.js 14 + TypeScript + Tailwind + Zustand + DnD Kit

## 📖 Documentação Completa

- 📘 [README.md](README.md) - Visão geral
- 📗 [INSTALLATION.md](INSTALLATION.md) - Instalação detalhada
- 📕 [FEATURES.md](FEATURES.md) - Funcionalidades completas

---

**Pronto para começar! 🚀**

