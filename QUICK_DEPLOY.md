# ⚡ Deploy Rápido - 3 Comandos

## 🎯 Para Colocar no GitHub e Rodar em Produção

### Passo 1: Preparar Build (No Seu Computador)

```powershell
# Fazer build do frontend
cd frontend
npm install
npm run build
cd ..

# Verificar se criou a pasta frontend/out
dir frontend\out
```

Deve mostrar vários arquivos HTML e a pasta `_next`.

---

### Passo 2: Enviar para GitHub

```powershell
# Inicializar Git (se ainda não tiver)
git init

# Adicionar todos os arquivos (incluindo o build)
git add .

# Commitar
git commit -m "Trello Nippon - Production Ready"

# Criar repositório no GitHub (https://github.com/new)
# Depois executar:
git remote add origin https://github.com/SEU-USUARIO/trello-nippon.git
git branch -M main
git push -u origin main
```

---

### Passo 3: Rodar no Servidor/Produção

```bash
# 1. Clonar
git clone https://github.com/SEU-USUARIO/trello-nippon.git
cd trello-nippon

# 2. Criar .env
cat > backend/.env << 'EOF'
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
JWT_SECRET=mude_para_algo_super_secreto_e_aleatorio_12345
EOF

# 3. Rodar!
npm install
npm start
```

**PRONTO! 🎉**

Acesse: http://IP-DO-SERVIDOR:5000

---

## 🎯 Resumo Ultra Simplificado

### No GitHub

1. Build: `npm run build:frontend`
2. Push: `git push`

### No Servidor

1. Clone: `git clone SEU-REPO`
2. Configure: `criar backend/.env`
3. Rode: `npm install && npm start`

**3 comandos em cada lugar!** ⚡

---

## 🌐 Exemplo: Deploy no Render (GRÁTIS)

### Opção A: Via GitHub (Automático)

1. Acesse: https://render.com
2. Cadastre-se (grátis)
3. Clique em **"New +"** → **"Web Service"**
4. Conecte seu repositório GitHub
5. Configure:
   - **Name**: trello-nippon
   - **Build Command**: `npm run build:frontend`
   - **Start Command**: `npm start`
6. Adicione **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=sua_uri
   JWT_SECRET=sua_chave
   PORT=5000
   ```
7. Clique em **"Create Web Service"**

**Deploy automático toda vez que você fizer push!** 🚀

### Opção B: Via Dashboard

Mesmas configurações acima, mas você faz upload do código direto.

---

## 🔥 Exemplo: Deploy no Railway (GRÁTIS)

1. Acesse: https://railway.app
2. Cadastre-se com GitHub
3. Clique em **"New Project"** → **"Deploy from GitHub repo"**
4. Selecione seu repositório
5. Railway detecta automaticamente!
6. Adicione variáveis de ambiente:
   ```
   NODE_ENV=production
   MONGODB_URI=sua_uri
   JWT_SECRET=sua_chave
   ```
7. Deploy automático! ✅

URL gerada automaticamente: `seu-app.railway.app`

---

## 💰 Comparação de Plataformas (Grátis)

| Plataforma | Vantagens | Deploy |
|------------|-----------|--------|
| **Render** | 750h/mês grátis, fácil | Automático via GitHub |
| **Railway** | $5 crédito/mês, rápido | Automático via GitHub |
| **Heroku** | Não é mais grátis | Manual |
| **Vercel** | Só frontend, ilimitado | Automático |
| **VPS** | Controle total | Manual |

**Recomendo: Render ou Railway** 👍

---

## 📁 O Que Está no GitHub

Seu repositório terá:

```
✅ Backend (código + dependências)
✅ Frontend (código + BUILD na pasta out/)
✅ Scripts de inicialização (start.js)
✅ Documentação completa
✅ Arquivos .bat para Windows
```

**Qualquer pessoa pode clonar e rodar!**

---

## 🚀 Comandos do Projeto

### Desenvolvimento (Local)

```powershell
start-dev.bat
# Ou: npm run dev:backend e npm run dev:frontend
```

### Build (Preparar para Produção)

```powershell
deploy.bat
# Ou: npm run build:frontend
```

### Produção (Após Build)

```powershell
npm start
# Ou: start-production.bat
```

---

## ✅ Checklist Final

### Antes de Enviar para GitHub

- [ ] Fez `npm run build:frontend`
- [ ] Pasta `frontend/out` foi criada
- [ ] Testou com `npm start` localmente
- [ ] Funcionou em http://localhost:5000
- [ ] Removeu informações sensíveis do código
- [ ] Arquivo `.env` NÃO está no Git (apenas .env.example)

### Ao Deploy

- [ ] Clonou do GitHub
- [ ] Criou arquivo `backend/.env`
- [ ] Configurou MongoDB URI
- [ ] Executou `npm install`
- [ ] Executou `npm start`
- [ ] Servidor rodando!

---

## 🎯 Exemplo Completo (Render)

### 1. Preparar Localmente

```powershell
npm run build:frontend
git add .
git commit -m "Production build"
git push
```

### 2. No Render

1. Conecte GitHub
2. Configure:
   - Build: `npm run build:frontend`
   - Start: `npm start`
   - Port: `5000`
3. Variáveis de ambiente:
   ```
   NODE_ENV=production
   MONGODB_URI=sua_uri_aqui
   JWT_SECRET=sua_chave_aqui
   ```

### 3. Deploy

Render faz automaticamente!

**URL**: `seu-app.onrender.com` ✨

---

## 📝 Arquivo start.js

Criei um arquivo especial `start.js` que:

- ✅ Verifica se dependências estão instaladas
- ✅ Verifica se build do frontend existe
- ✅ Verifica se .env está configurado
- ✅ Inicia o servidor automaticamente
- ✅ Mostra mensagens úteis

**Um único comando**: `npm start` ou `node start.js`

---

## 🎉 Pronto para GitHub!

Agora seu repositório está configurado para:

1. **Clone** → `git clone`
2. **Configure** → criar `.env`
3. **Rode** → `npm start`

**Simples assim!** 🚀

---

Quer ajuda para fazer o deploy agora em alguma plataforma específica?

