# 🚀 Começar SEM Configurar Email

## 💡 Boa Notícia!

Você **NÃO precisa configurar email** para usar o sistema! O Trello Nippon funciona perfeitamente sem verificação de email.

## ✅ O Que Funciona SEM Email

- ✅ Criar conta
- ✅ Fazer login
- ✅ Criar projetos
- ✅ Criar tarefas
- ✅ Kanban com drag-and-drop
- ✅ Calendário
- ✅ Comentários
- ✅ Upload de arquivos
- ✅ Compartilhar projetos
- ✅ Gerenciar membros
- ✅ **TUDO!**

## 🎯 Como Começar AGORA (Sem Email)

### 1. Configure Apenas o MongoDB

Edite `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
JWT_SECRET=trello_nippon_super_secret_jwt_key_2024
NODE_ENV=development

# Email NÃO configurado (comentado)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=seu-email@gmail.com
# EMAIL_PASS=senha-de-app
# FRONTEND_URL=http://localhost:3000
```

### 2. Inicie os Servidores

```powershell
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### 3. Use o Sistema!

1. Acesse: http://localhost:3000
2. Crie sua conta
3. Comece a usar!

## 📝 O Que Acontece

### Ao Criar Conta (SEM email configurado):

```
Backend logs:
⚠️ Credenciais de email não configuradas. Emails não serão enviados.
✅ Usuário criado no banco de dados
📧 Email de verificação não enviado (serviço não configurado)
```

**Isso é NORMAL e está OK!** ✅

### No Sistema:

- Conta é criada normalmente
- Login funciona
- Todos os recursos funcionam
- Apenas não tem verificação de email
- Banner amarelo pode aparecer, mas é só ignorar

## 🎨 Desabilitar Banner de Email (Opcional)

Se quiser remover o banner amarelo enquanto não configura email:

### Opção 1: Comentar o Banner

Edite `frontend/src/app/dashboard/page.tsx` e comente:

```typescript
// {/* Banner de verificação de email */}
// <EmailVerificationBanner />
```

### Opção 2: Marcar Como Verificado no Banco

No MongoDB Compass ou Shell:

```javascript
db.users.updateMany(
  {},
  { $set: { emailVerified: true } }
)
```

## 📧 Configurar Email Depois (Quando Quiser)

Quando decidir configurar o email:

### Opção Fácil: Gmail

1. **Criar Senha de App do Gmail**:
   - Acesse: https://myaccount.google.com/security
   - Ative "Verificação em 2 etapas"
   - Procure "Senhas de app"
   - Gere uma senha para "Trello Nippon"
   - Copie a senha (16 dígitos)

2. **Adicionar no .env**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=seu-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   FRONTEND_URL=http://localhost:3000
   ```

3. **Reiniciar Backend**:
   ```powershell
   # Ctrl + C para parar
   npm run dev
   ```

4. **Testar**:
   - Registre um novo usuário
   - Email será enviado automaticamente!

## 🎯 Recomendação

**Para começar a usar o sistema AGORA**:

1. ✅ Configure apenas MongoDB (já feito!)
2. ✅ Inicie backend e frontend
3. ✅ Use o sistema completo
4. ⏳ Configure email depois (quando tiver tempo)

## 🔧 Seu .env Mínimo

Para começar agora, seu `backend/.env` precisa APENAS disso:

```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
JWT_SECRET=trello_nippon_super_secret_jwt_key_2024
NODE_ENV=development
```

**Nada mais!** ✨

---

## 📋 Resumo

| Recurso | Precisa Email? | Status |
|---------|----------------|--------|
| Criar conta | ❌ Não | ✅ Funciona |
| Login | ❌ Não | ✅ Funciona |
| Projetos | ❌ Não | ✅ Funciona |
| Tarefas | ❌ Não | ✅ Funciona |
| Kanban | ❌ Não | ✅ Funciona |
| Calendário | ❌ Não | ✅ Funciona |
| Compartilhar | ❌ Não | ✅ Funciona |
| Verificação de conta | ✅ Sim | ⏳ Opcional |

---

**Comece a usar AGORA e configure email depois! 🎉**

