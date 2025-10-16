# 🚀 Deploy via GitHub - Guia Completo

## 🎯 Objetivo

Subir o projeto no GitHub e rodar em produção com apenas `npm start`.

## 📋 Passo a Passo Completo

### 1️⃣ Preparar o Build do Frontend

Antes de enviar para o GitHub, faça o build:

```powershell
cd frontend
npm install
npm run build
```

Isso cria a pasta `frontend/out` com o site compilado.

### 2️⃣ Preparar Arquivos de Configuração

#### A. Verificar .gitignore

O arquivo `.gitignore` já está configurado para **INCLUIR** a pasta `out` no Git.

#### B. Criar .env de Exemplo

O arquivo `backend/.env.example` já existe com as configurações necessárias.

### 3️⃣ Commitar e Enviar para GitHub

```powershell
# Na raiz do projeto
git init
git add .
git commit -m "Deploy inicial do Trello Nippon"

# Criar repositório no GitHub e depois:
git remote add origin https://github.com/SEU-USUARIO/trello-nippon.git
git branch -M main
git push -u origin main
```

### 4️⃣ No Servidor de Produção

Agora em qualquer servidor (VPS, cloud, etc):

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU-USUARIO/trello-nippon.git
cd trello-nippon

# 2. Criar arquivo .env no backend
cd backend
nano .env  # ou vim, ou qualquer editor

# Cole suas configurações:
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
JWT_SECRET=sua_chave_secreta_forte_e_aleatoria
# ... outras configurações

# Salve e saia (Ctrl+X, Y, Enter no nano)
cd ..

# 3. Instalar dependências e iniciar
npm install
npm start
```

**Pronto! 🎉**

O servidor estará rodando e servindo frontend + backend!

---

## 🔥 Método AINDA MAIS SIMPLES

Se você já fez o build local e commitou:

### No Servidor

```bash
git clone SEU-REPO
cd trello-nippon
echo "PORT=5000
MONGODB_URI=sua_uri
JWT_SECRET=sua_chave
NODE_ENV=production" > backend/.env
npm start
```

**3 comandos e pronto!** 🚀

---

## 🌐 Deploy em Plataformas Específicas

### Heroku

```bash
# 1. Fazer build local
npm run build:frontend

# 2. Commitar build
git add .
git commit -m "Production build"

# 3. Deploy
heroku create trello-nippon
git push heroku main

# 4. Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="sua_uri"
heroku config:set JWT_SECRET="sua_chave"

# 5. Abrir
heroku open
```

### Render

1. Conecte seu repositório GitHub
2. Configure:
   - **Build Command**: `npm run build:frontend`
   - **Start Command**: `npm start`
3. Adicione variáveis de ambiente
4. Deploy automático! ✅

### Railway

1. Conecte GitHub
2. Configure variáveis de ambiente
3. Railway detecta e faz deploy automático!

### DigitalOcean / AWS / VPS

```bash
# No servidor
git clone seu-repo
cd trello-nippon

# Criar .env
cat > backend/.env << EOF
PORT=5000
NODE_ENV=production
MONGODB_URI=sua_uri
JWT_SECRET=sua_chave
EOF

# Instalar e rodar
npm install
npm start

# Para rodar em background (PM2)
npm install -g pm2
pm2 start start.js --name trello-nippon
pm2 save
pm2 startup
```

---

## 📦 O Que Vai para o GitHub

### ✅ Incluído no Git

- ✅ Todo código fonte (backend + frontend)
- ✅ Build do frontend (`frontend/out`)
- ✅ package.json e dependências
- ✅ Scripts de inicialização
- ✅ Documentação completa

### ❌ NÃO incluído (gitignore)

- ❌ node_modules
- ❌ .env (segurança!)
- ❌ uploads (arquivos de usuários)
- ❌ .next (cache do Next.js)

---

## 🔐 Segurança no Deploy

### NUNCA commite:

❌ Arquivo `.env` com senhas
❌ Senhas de email
❌ Connection strings do MongoDB
❌ JWT_SECRET em código

### ✅ Faça:

✅ Use `.env.example` como referência
✅ Configure `.env` no servidor
✅ Use variáveis de ambiente da plataforma
✅ Mantenha secrets fora do Git

---

## 🎯 Estrutura do Repositório GitHub

```
seu-repositorio/
├── backend/
│   ├── ... (código)
│   ├── .env.example  ✅ (vai pro Git)
│   └── .env          ❌ (NÃO vai pro Git)
│
├── frontend/
│   ├── src/          ✅ (vai pro Git)
│   ├── out/          ✅ (vai pro Git - build)
│   └── node_modules/ ❌ (NÃO vai)
│
├── start.js          ✅ Script de inicialização
├── package.json      ✅ Configuração
└── README.md         ✅ Documentação
```

---

## ⚡ Comandos Rápidos

### Preparar para GitHub

```powershell
# 1. Fazer build
cd frontend
npm run build
cd ..

# 2. Commitar
git add .
git commit -m "Production ready"
git push
```

### No Servidor (após clonar)

```bash
# Clone, configure .env e:
npm install
npm start
```

**SÓ ISSO!** 🎉

---

## 🎁 Bonus: Package.json Atualizado

O `package.json` na raiz agora tem:

```json
{
  "scripts": {
    "start": "node start.js",  ← Comando único!
    "postinstall": "npm run install:backend"  ← Auto-instala backend
  }
}
```

Isso significa:

```bash
npm install  # Instala tudo automaticamente
npm start    # Inicia o servidor
```

**Apenas 2 comandos!** ✨

---

## 🔄 Fluxo Completo

### No Seu Computador (Uma Vez)

```powershell
# 1. Fazer build
npm run build:frontend

# 2. Commitar
git add .
git commit -m "Build for production"
git push
```

### No Servidor (Sempre que precisar)

```bash
# 1. Clonar
git clone https://github.com/seu-usuario/trello-nippon.git
cd trello-nippon

# 2. Configurar .env
cat > backend/.env << 'EOF'
PORT=5000
NODE_ENV=production
MONGODB_URI=sua_connection_string
JWT_SECRET=sua_chave_forte
EOF

# 3. Iniciar (PRONTO!)
npm install
npm start
```

**Acesse**: http://seu-servidor:5000

---

## 📝 Checklist de Deploy

- [ ] Fez build do frontend (`npm run build:frontend`)
- [ ] Testou localmente (`npm start`)
- [ ] Funcionou em localhost:5000
- [ ] Commitou build no Git
- [ ] Enviou para GitHub (`git push`)
- [ ] Clonou no servidor
- [ ] Criou arquivo `.env` no servidor
- [ ] Executou `npm install`
- [ ] Executou `npm start`
- [ ] Acessou pelo IP/domínio do servidor

---

## 🎉 Resultado Final

Você terá um repositório GitHub onde:

```bash
git clone SEU-REPO
cd trello-nippon
npm install  # Instala dependências
npm start    # Roda tudo!
```

**Frontend + Backend rodando em UMA ÚNICA PORTA!** 🚀

---

Quer que eu crie um exemplo de deploy específico? (Heroku, Railway, Render, etc)

