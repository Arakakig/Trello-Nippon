# 🎯 Setup Completo - Trello Nippon

## ✅ Tudo Que Você Precisa Fazer

### 1️⃣ Configurar MongoDB Atlas (Já Feito!)

Você já tem a connection string:
```
mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
```

---

### 2️⃣ Configurar Backend

#### A. Criar arquivo .env

Crie o arquivo `backend/.env` com este conteúdo:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados MongoDB Atlas
MONGODB_URI=mongodb+srv://admin:SUA_SENHA_AQUI@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello

# JWT
JWT_SECRET=trello_nippon_super_secret_jwt_key_2024

# Email (OPCIONAL - Configure depois se quiser)
# Deixe comentado por enquanto:
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=seu-email@gmail.com
# EMAIL_PASS=sua-senha-de-app
# FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Substitua `SUA_SENHA_AQUI` pela sua senha real do MongoDB Atlas!

#### B. Instalar Dependências

```powershell
cd backend
npm install
```

#### C. Iniciar Backend

```powershell
npm run dev
```

Deve aparecer:
```
✅ MongoDB conectado com sucesso
✅ Servidor rodando na porta 5000
```

---

### 3️⃣ Configurar Frontend

#### A. Criar arquivo .env.local

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### B. Instalar Dependências

```powershell
cd frontend
npm install
```

#### C. Iniciar Frontend

```powershell
npm run dev
```

---

### 4️⃣ Testar a Aplicação

1. Acesse: http://localhost:3000
2. Clique em "Registre-se"
3. Crie sua conta
4. Você será redirecionado para o dashboard
5. Comece a criar tarefas!

---

## 📧 Email (Configuração Opcional)

Por enquanto, o sistema funciona **SEM configurar email**. Os usuários podem usar normalmente, apenas não terão verificação de email.

### Para Ativar Emails Depois:

1. Escolha uma plataforma (Gmail recomendado para testes)
2. Siga o guia: **[EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md)**
3. Adicione as configurações no `backend/.env`
4. Reinicie o backend

---

## 🎯 Comandos Resumidos

```powershell
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Acessar
# http://localhost:3000
```

---

## ✅ Checklist Final

- [ ] MongoDB Atlas configurado (.env com senha)
- [ ] Backend: npm install executado
- [ ] Backend: servidor rodando (porta 5000)
- [ ] Frontend: npm install executado
- [ ] Frontend: servidor rodando (porta 3000)
- [ ] Consegui acessar http://localhost:3000
- [ ] Consegui criar uma conta
- [ ] Consegui fazer login
- [ ] Consegui criar um projeto
- [ ] Consegui criar uma tarefa

---

## 🐛 Se Tiver Problemas

### Erro no Backend
- Verifique a senha do MongoDB no .env
- Verifique se tem internet (MongoDB Atlas é online)
- Tente parar e reiniciar o backend

### Erro no Frontend
- Verifique se o backend está rodando
- Verifique o arquivo .env.local
- Limpe o cache: Ctrl + Shift + R no navegador

### Email não configurado (Normal!)
Se você ver no backend:
```
⚠️ Credenciais de email não configuradas. Emails não serão enviados.
```

Isso é **NORMAL**! O sistema funciona sem email. Configure depois se quiser.

---

## 💡 Dica

**Comece SEM email configurado!**

1. Use o sistema normalmente
2. Depois, quando estiver tudo funcionando
3. Configure o email seguindo o EMAIL_SETUP_GUIDE.md

Isso facilita o teste inicial!

---

**Pronto para começar! 🚀**

