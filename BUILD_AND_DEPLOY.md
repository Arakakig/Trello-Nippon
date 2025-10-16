# 🚀 Build e Deploy - Trello Nippon

## 📦 Como Gerar Build do Frontend para o Backend

Existem duas formas de fazer deploy do Trello Nippon:

---

## 🎯 Opção 1: Frontend e Backend Juntos (Recomendado)

Nesta configuração, o Express serve tanto a API quanto o frontend.

### Passo a Passo

#### 1. Configurar Variáveis de Ambiente

**Frontend** - Edite `frontend/.env.local`:
```env
# Em produção, a API estará no mesmo domínio
NEXT_PUBLIC_API_URL=/api
```

**Backend** - Edite `backend/.env`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=sua_connection_string_aqui
JWT_SECRET=sua_chave_secreta_forte
# ... outras configurações
```

#### 2. Fazer Build do Frontend

```powershell
cd frontend
npm run build
```

Isso vai gerar a pasta `frontend/out` com todos os arquivos estáticos.

#### 3. Iniciar o Servidor em Produção

```powershell
cd backend
set NODE_ENV=production
npm start
```

#### 4. Acessar

Acesse: **http://localhost:5000**

✅ Frontend será servido pelo Express
✅ API estará em /api/*
✅ Tudo em um único servidor!

---

## 🎯 Opção 2: Frontend e Backend Separados

Mantenha os servidores separados (como está agora).

### Build do Frontend

```powershell
cd frontend
npm run build
npm start
```

Frontend rodará em: http://localhost:3000

### Backend

```powershell
cd backend
npm run dev
```

Backend rodará em: http://localhost:5000

---

## 🛠️ Scripts Prontos para Usar

### Desenvolvimento

```powershell
# Instalar tudo
npm run install:all

# Rodar backend
npm run dev:backend

# Rodar frontend (outro terminal)
npm run dev:frontend
```

### Produção (Frontend + Backend Juntos)

```powershell
# Build completo
npm run build:all

# Iniciar em produção
npm run start
```

Acesse: http://localhost:5000

---

## 📁 Estrutura Após Build

```
Trello Nippon/
├── backend/
│   ├── ... (código do backend)
│   └── server.js (agora serve o frontend também!)
│
└── frontend/
    └── out/              ← Build estático do Next.js
        ├── index.html
        ├── _next/
        ├── login/
        ├── register/
        └── dashboard/
```

---

## 🌐 Deploy em Serviços de Hosting

### Deploy no Heroku

1. **Criar arquivo `Procfile` na raiz**:
```
web: cd backend && npm start
```

2. **Fazer build antes de enviar**:
```powershell
git add .
git commit -m "Deploy build"
npm run build:frontend
git add frontend/out
git commit -m "Add frontend build"
git push heroku main
```

3. **Configurar variáveis de ambiente** no painel do Heroku:
```
NODE_ENV=production
MONGODB_URI=sua_connection_string
JWT_SECRET=sua_chave
FRONTEND_URL=https://seu-app.herokuapp.com
```

### Deploy no Railway

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Railway faz o build automaticamente!

### Deploy no Render

1. Crie um **Web Service**
2. Build Command: `npm run build:all`
3. Start Command: `npm start`
4. Configure variáveis de ambiente

---

## ⚙️ Configurações de Produção

### Backend (.env em produção)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=chave_super_secreta_aleatoria_mude_esta
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxx
FRONTEND_URL=https://seuapp.com
```

### Frontend (.env.local em produção)

```env
# API no mesmo domínio
NEXT_PUBLIC_API_URL=/api
```

---

## 🔒 Checklist de Segurança

Antes de fazer deploy:

- [ ] Mudou JWT_SECRET para algo aleatório e forte
- [ ] Configurou CORS para domínio específico (não *)
- [ ] Configurou MongoDB Atlas (não local)
- [ ] Configurou EMAIL com SendGrid (não Gmail)
- [ ] NODE_ENV=production
- [ ] Removeu console.logs sensíveis
- [ ] Testou localmente com NODE_ENV=production

---

## 🧪 Testar Build Localmente

### 1. Build do Frontend

```powershell
cd frontend
npm run build
```

Deve gerar a pasta `out/`.

### 2. Testar Backend Servindo Frontend

```powershell
cd backend
set NODE_ENV=production
npm start
```

### 3. Acessar

http://localhost:5000

Deve mostrar o frontend funcionando!

---

## 📊 Comparação

| Aspecto | Dev (Separado) | Produção (Junto) |
|---------|----------------|------------------|
| Frontend | localhost:3000 | localhost:5000 |
| Backend | localhost:5000 | localhost:5000 |
| Servidores | 2 | 1 |
| Build | Não precisa | Precisa fazer build |
| Hot reload | ✅ Sim | ❌ Não |
| Melhor para | Desenvolvimento | Produção |

---

## 🎯 Comandos Rápidos

### Desenvolvimento
```powershell
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

### Build Local (Testar)
```powershell
npm run build:frontend
cd backend
set NODE_ENV=production
npm start
# Acesse: http://localhost:5000
```

### Deploy Completo
```powershell
npm run build:all
npm start
```

---

## 🐛 Troubleshooting

### Erro: Cannot GET /

**Causa**: Frontend não foi buildado ou path incorreto

**Solução**:
```powershell
cd frontend
npm run build
# Verifique se a pasta 'out' foi criada
```

### Erro: API não funciona

**Causa**: Frontend tentando acessar localhost:3000

**Solução**: Em produção, use `NEXT_PUBLIC_API_URL=/api` no .env.local

### Erro 404 em rotas do frontend

**Causa**: Next.js export estático tem limitações

**Solução**: Já está configurado com `trailingSlash: true`

---

## 📝 Resumo

Para colocar o frontend no backend:

```powershell
# 1. Fazer build
cd frontend
npm run build

# 2. Iniciar backend em modo produção
cd ../backend
set NODE_ENV=production
npm start

# 3. Acessar
# http://localhost:5000
```

**Frontend e Backend agora rodam juntos! 🎉**

---

## 🎁 Bonus: Script Único

Criei um script que faz tudo de uma vez:

```powershell
npm run production
```

Isso vai:
1. Instalar dependências
2. Fazer build do frontend
3. Iniciar o servidor
4. Tudo pronto! ✅

---

**Quer que eu crie mais alguma configuração de deploy?** (Docker, Nginx, etc)

