# 🔧 Render - Email Bloqueado (Solução)

## ⚠️ Problema

O Render **bloqueia portas SMTP** (587, 465, 25) por padrão para evitar spam.

Erro: `Connection timeout` ao tentar enviar email.

## ✅ Solução 1: Sistema Funciona SEM Email (Atual)

**Já configurei o sistema para funcionar perfeitamente sem email!**

### O Que Acontece Agora

- ✅ Usuários podem criar contas
- ✅ Podem fazer login normalmente
- ✅ Todas as funcionalidades funcionam
- ✅ Apenas não há verificação de email (opcional)

### No Render

**REMOVA** as variáveis de email do Environment:
- ❌ EMAIL_HOST
- ❌ EMAIL_PORT
- ❌ EMAIL_USER
- ❌ EMAIL_PASS

Deixe apenas:
- ✅ NODE_ENV=production
- ✅ MONGODB_URI=sua_uri
- ✅ JWT_SECRET=sua_chave
- ✅ FRONTEND_URL=https://trello-nippon.onrender.com

**Faça novo deploy** e pronto! Sistema funcionará 100%.

---

## 🚀 Solução 2: Usar SendGrid (Recomendado)

Se você **REALMENTE** quer emails, use SendGrid (tem API, não usa SMTP):

### Passo 1: Criar Conta SendGrid

1. Acesse: https://sendgrid.com/
2. Cadastre-se (100 emails/dia grátis)
3. Verifique seu email

### Passo 2: Criar API Key

1. Vá em **Settings → API Keys**
2. Crie uma API Key
3. Copie a key (começa com `SG.`)

### Passo 3: Instalar @sendgrid/mail

Adicione no `backend/package.json`:
```json
"@sendgrid/mail": "^7.7.0"
```

### Passo 4: Atualizar email.js

Crie `backend/config/email-sendgrid.js`:
```javascript
const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendVerificationEmail = async (user, token) => {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false };
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const msg = {
    to: user.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: '✅ Confirme seu email - Trello Nippon',
    html: `<h1>Olá ${user.name}!</h1>
           <p><a href="${verificationUrl}">Clique aqui para verificar</a></p>`
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

module.exports = { sendVerificationEmail };
```

### Passo 5: Configurar no Render

Adicione no Environment:
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=seu-email@verificado.com
```

---

## 🎯 Recomendação

**Use o sistema SEM email por enquanto!**

É mais simples e funciona perfeitamente. Você pode adicionar email depois se precisar.

### No Render Environment, deixe APENAS:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
JWT_SECRET=chave_forte_aleatoria_12345
FRONTEND_URL=https://trello-nippon.onrender.com
```

**NÃO adicione** EMAIL_HOST, EMAIL_USER, EMAIL_PASS.

### Fazer Deploy

```powershell
git add .
git commit -m "Remove email config for Render"
git push
```

Aguarde o deploy e teste: https://trello-nippon.onrender.com/

---

## ✅ O Sistema Funciona 100% Sem Email!

Todos os recursos funcionam:
- ✅ Criar conta
- ✅ Login
- ✅ Projetos
- ✅ Tarefas
- ✅ Kanban
- ✅ Calendário
- ✅ Compartilhamento
- ✅ Tudo!

**Recomendo seguir sem email. Configure depois se realmente precisar!** 🚀
