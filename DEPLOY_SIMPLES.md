# 🚀 Deploy Simplificado - Windows

## 🎯 3 Maneiras de Rodar o Projeto

---

## 1️⃣ DESENVOLVIMENTO (2 Servidores Separados) - ATUAL

**Como você está usando agora**

### Iniciar

Clique duas vezes no arquivo:
```
start-dev.bat
```

Ou manualmente:
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Acesse**: http://localhost:3000

✅ Hot reload
✅ Fácil de desenvolver
✅ Logs separados

---

## 2️⃣ PRODUÇÃO (1 Servidor Único) - RECOMENDADO

**Frontend e Backend juntos**

### Build Automático

Clique duas vezes no arquivo:
```
deploy.bat
```

Isso vai:
1. ✅ Instalar todas as dependências
2. ✅ Fazer build do frontend
3. ✅ Preparar tudo para produção

### Iniciar Produção

Depois do build, clique em:
```
start-production.bat
```

**Acesse**: http://localhost:5000

✅ Apenas 1 servidor
✅ Otimizado
✅ Pronto para hospedagem

---

## 3️⃣ PASSO A PASSO MANUAL

Se preferir fazer manualmente:

### Passo 1: Build do Frontend

```powershell
cd frontend
npm run build
```

Isso cria a pasta `frontend/out` com o site compilado.

### Passo 2: Configurar Ambiente

Edite `backend/.env`:
```env
NODE_ENV=production
```

Edite `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=/api
```

### Passo 3: Iniciar Servidor

```powershell
cd backend
set NODE_ENV=production
npm start
```

### Passo 4: Acessar

http://localhost:5000

---

## 📁 O Que Acontece no Build

### Antes (Desenvolvimento)
```
Frontend: localhost:3000 → Next.js dev server
Backend:  localhost:5000 → Express API
```

### Depois (Produção)
```
Tudo: localhost:5000 → Express serve frontend E API
```

---

## 🎯 Qual Usar?

| Situação | Modo | Como Iniciar |
|----------|------|--------------|
| Desenvolvendo | Dev | `start-dev.bat` |
| Testando localmente | Produção | `deploy.bat` + `start-production.bat` |
| Deploy em servidor | Produção | Veja BUILD_AND_DEPLOY.md |

---

## ✨ Arquivos Criados para Facilitar

Você agora tem estes arquivos na raiz:

1. **start-dev.bat** - Inicia modo desenvolvimento (2 terminais)
2. **deploy.bat** - Faz build completo
3. **start-production.bat** - Inicia modo produção (1 servidor)
4. **build.js** - Script Node.js de build (alternativo)

### Como Usar

**Para Desenvolver**:
```
Clique em: start-dev.bat
```

**Para Testar Produção Localmente**:
```
1. Clique em: deploy.bat
2. Aguarde o build terminar
3. Clique em: start-production.bat
4. Acesse: http://localhost:5000
```

---

## 🌐 Deploy em Servidor Real

### Heroku

```powershell
# 1. Fazer build
deploy.bat

# 2. Criar Procfile
# (já está criado no projeto)

# 3. Deploy
git add .
git commit -m "Production build"
heroku create
git push heroku main
```

### VPS (DigitalOcean, AWS, etc)

```bash
# No servidor
git clone seu-repositorio
cd trello-nippon
npm run build:all
npm start
```

---

## 📦 Estrutura de Build

Após executar `deploy.bat`:

```
Trello Nippon/
├── frontend/
│   └── out/           ← Site compilado (HTML, CSS, JS)
│       ├── index.html
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       └── _next/     ← Assets do Next.js
│
└── backend/
    └── server.js      ← Serve API + Frontend
```

---

## ✅ Checklist de Deploy

### Desenvolvimento
- [ ] Executou `start-dev.bat`
- [ ] Backend rodando em 5000
- [ ] Frontend rodando em 3000
- [ ] Consegue acessar localhost:3000

### Produção Local
- [ ] Executou `deploy.bat`
- [ ] Build completado sem erros
- [ ] Pasta `frontend/out` foi criada
- [ ] Executou `start-production.bat`
- [ ] Consegue acessar localhost:5000

### Produção em Servidor
- [ ] Configurou variáveis de ambiente
- [ ] Fez build com `npm run build:all`
- [ ] Iniciou com `npm start`
- [ ] Configurou domínio/DNS

---

## 🎉 Resumo Rápido

### Para Usar AGORA (Desenvolvimento)

```
Clique duas vezes: start-dev.bat
Acesse: http://localhost:3000
```

### Para Preparar Deploy (Produção)

```
Clique duas vezes: deploy.bat
Depois: start-production.bat
Acesse: http://localhost:5000
```

---

**Fácil, rápido e automatizado! 🚀**

Documentação completa em: [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md)

