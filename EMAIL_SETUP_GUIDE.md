# 📧 Guia de Configuração de Email - Trello Nippon

## ✉️ Sistema de Verificação de Email

Este guia explica como configurar o envio de emails de verificação no Trello Nippon.

## 🎯 O Que Foi Implementado

✅ **Verificação de Email Obrigatória**
- Campo `emailVerified` no banco de dados
- Token de verificação com expiração de 24 horas
- Email HTML bonito enviado após registro
- Página de verificação de email

✅ **Funcionalidades**
- 👁️ Botão mostrar/ocultar senha
- ✉️ Email de confirmação após cadastro
- ✅ Status de conta ativa/não ativa
- 🔄 Reenviar email de verificação

## 🚀 Opções de Configuração

Você tem 3 opções para configurar o envio de emails:

### Opção 1: Gmail (Recomendado para Testes)

<details open>
<summary><strong>📗 Passo a Passo com Gmail</strong></summary>

#### 1. Ativar "Senha de App" no Gmail

1. Acesse: https://myaccount.google.com/security
2. Certifique-se de que a **Verificação em 2 etapas** está ativada
3. Procure por **"Senhas de app"**
4. Clique em **"Senhas de app"**
5. Selecione:
   - **App**: Outro (nome personalizado)
   - **Nome**: Trello Nippon
6. Clique em **"Gerar"**
7. **Copie a senha de 16 dígitos** gerada

#### 2. Configurar o .env

Edite o arquivo `backend/.env`:

```env
# ... outras configurações ...

# Configurações de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Senha de app gerada
FRONTEND_URL=http://localhost:3000
```

#### 3. Instalar Dependências

```bash
cd backend
npm install
```

#### 4. Testar

Reinicie o backend e registre um novo usuário!

</details>

---

### Opção 2: SendGrid (Recomendado para Produção)

<details>
<summary><strong>📘 Passo a Passo com SendGrid</strong></summary>

#### 1. Criar Conta no SendGrid

1. Acesse: https://sendgrid.com/
2. Crie uma conta gratuita (100 emails/dia)
3. Verifique seu email

#### 2. Gerar API Key

1. Vá em **Settings → API Keys**
2. Clique em **"Create API Key"**
3. Nome: Trello Nippon
4. Permissões: **Full Access**
5. **Copie a API Key** (só mostra uma vez!)

#### 3. Verificar Sender Identity

1. Vá em **Settings → Sender Authentication**
2. Clique em **"Verify a Single Sender"**
3. Preencha com seu email
4. Verifique o email recebido

#### 4. Configurar o .env

```env
# Configurações de Email (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey  # Literalmente "apikey"
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxx  # Sua API Key
FRONTEND_URL=http://localhost:3000
```

#### 5. Atualizar o código (Opcional)

Em `backend/config/email.js`, atualize o `from`:

```javascript
from: `"Trello Nippon" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
```

E adicione ao `.env`:
```env
EMAIL_FROM=seu-email-verificado@dominio.com
```

</details>

---

### Opção 3: Mailtrap (Para Desenvolvimento/Testes)

<details>
<summary><strong>📙 Passo a Passo com Mailtrap</strong></summary>

**Perfeito para desenvolvimento - captura emails sem enviar de verdade!**

#### 1. Criar Conta no Mailtrap

1. Acesse: https://mailtrap.io/
2. Crie uma conta gratuita
3. Acesse a **Inbox**

#### 2. Copiar Credenciais

Na inbox, clique em **"Show Credentials"** e copie:
- Host
- Port
- Username
- Password

#### 3. Configurar o .env

```env
# Configurações de Email (Mailtrap - Desenvolvimento)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=xxxxxxxxxxxxxxx  # Username do Mailtrap
EMAIL_PASS=xxxxxxxxxxxxxxx  # Password do Mailtrap
FRONTEND_URL=http://localhost:3000
```

#### 4. Testar

Todos os emails aparecerão na sua Inbox do Mailtrap!

</details>

---

## ⚙️ Arquivo .env Completo

Seu `backend/.env` deve ficar assim:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados
MONGODB_URI=mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello

# JWT
JWT_SECRET=trello_nippon_super_secret_jwt_key_2024

# Email (Escolha UMA das opções acima)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testando a Configuração

### 1. Reiniciar o Backend

```bash
cd backend
npm run dev
```

### 2. Registrar Novo Usuário

1. Acesse: http://localhost:3000/register
2. Preencha os dados
3. Clique em "Criar conta"

### 3. Verificar Logs

No terminal do backend, você deve ver:
```
📧 Email de verificação enviado para: usuario@email.com
```

### 4. Verificar Email

- **Gmail/SendGrid**: Verifique sua caixa de entrada
- **Mailtrap**: Verifique a inbox do Mailtrap

### 5. Clicar no Link

Clique no botão **"Verificar Meu Email"** no email recebido.

### 6. Sucesso!

Você verá a página de confirmação e será redirecionado para o login.

## 🎨 Template do Email

O email enviado inclui:

✅ Header colorido com gradiente azul
✅ Mensagem de boas-vindas personalizada
✅ Botão grande de verificação
✅ Link alternativo (caso o botão não funcione)
✅ Lista de benefícios
✅ Design responsivo (funciona em mobile)
✅ Versão texto simples (para clientes sem HTML)

## 🔒 Segurança

### Boas Práticas Implementadas

✅ **Token Seguro**: 32 bytes aleatórios em hexadecimal
✅ **Expiração**: Token expira em 24 horas
✅ **Único Uso**: Token é deletado após verificação
✅ **Senha Protegida**: Senha de app (não a senha do Gmail)
✅ **HTTPS em Produção**: Use `EMAIL_SECURE=true` com porta 465

### ⚠️ Importante

❌ **NUNCA comite o arquivo .env no Git**
❌ **NUNCA compartilhe suas senhas de app**
❌ **NUNCA use sua senha real do Gmail**

## 📱 Funcionalidades da Interface

### 👁️ Mostrar/Ocultar Senha

- Ícone de olho ao lado do campo de senha
- Clique para alternar entre texto e senha
- Funciona em login e registro

### ✉️ Verificação de Email

- **Após Registro**: Toast mostrando "Verifique seu email"
- **No Login**: Banner amarelo se email não verificado
- **Botão Reenviar**: Pode reenviar o email de verificação
- **Página de Verificação**: Design bonito com feedback

## 🐛 Troubleshooting

### Email não está sendo enviado

**Sintomas**: Não recebo o email

**Soluções**:

1. Verifique os logs do backend
2. Certifique-se de que as credenciais estão corretas
3. Verifique se a porta não está bloqueada
4. Para Gmail: certifique-se de usar Senha de App, não a senha normal

### Erro "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa**: Senha de App não configurada no Gmail

**Solução**: Siga o passo 1 da Opção 1 (Gmail) acima

### Email vai para spam

**Causa**: Servidor não autenticado

**Solução**: 
- Use SendGrid para produção
- Configure SPF e DKIM no seu domínio
- Teste com Mailtrap durante desenvolvimento

### Token expirado

**Causa**: Link do email foi clicado após 24 horas

**Solução**:
1. Faça login normalmente
2. Clique em "Reenviar email de verificação"
3. Use o novo link em até 24 horas

## 🚀 Deploy em Produção

### Variáveis de Ambiente

Configure no seu serviço de hosting:

```env
# Heroku, Railway, Render, etc
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
FRONTEND_URL=https://seuapp.com
```

### Recomendações

1. **Use SendGrid** para produção
2. **Verifique seu domínio** no SendGrid
3. **Configure SPF/DKIM** para melhor entregabilidade
4. **Use EMAIL_SECURE=true** se usar porta 465
5. **Monitore** o envio de emails no dashboard do SendGrid

## 📊 Status da Conta

### No Banco de Dados

```javascript
{
  emailVerified: false,  // ❌ Não verificado
  emailVerified: true,   // ✅ Verificado
}
```

### Na Interface

- **Não verificado**: Banner amarelo de aviso
- **Verificado**: Acesso completo às funcionalidades

## 🎁 Extras Implementados

✅ **Email HTML Bonito**: Design profissional
✅ **Fallback Texto**: Para clientes sem suporte HTML
✅ **Responsive**: Funciona em mobile
✅ **Logs Detalhados**: Facilitam debug
✅ **Configuração Flexível**: Funciona mesmo sem email configurado
✅ **Reenvio**: Usuário pode pedir novo email
✅ **UX Completo**: Feedback em todas as etapas

## 📚 Arquivos Criados/Modificados

### Backend

✅ `models/User.js` - Campos de verificação adicionados
✅ `config/email.js` - ⭐ Novo serviço de email
✅ `routes/auth.js` - Rotas de verificação
✅ `package.json` - Nodemailer adicionado
✅ `.env.example` - Variáveis de email

### Frontend

✅ `components/PasswordInput.tsx` - ⭐ Componente de senha
✅ `app/verify-email/page.tsx` - ⭐ Página de verificação
✅ `app/login/page.tsx` - Toggle senha + aviso
✅ `app/register/page.tsx` - Toggle senha
✅ `types/index.ts` - Campo emailVerified
✅ `lib/api.ts` - Endpoints de email

## ✅ Checklist de Configuração

- [ ] Escolhi uma plataforma de email (Gmail/SendGrid/Mailtrap)
- [ ] Criei conta e obtive credenciais
- [ ] Configurei o arquivo `.env` do backend
- [ ] Instalei dependências (`npm install`)
- [ ] Reiniciei o backend
- [ ] Testei o registro
- [ ] Recebi o email de verificação
- [ ] Cliquei no link e verifiquei
- [ ] Fiz login com sucesso

---

**Pronto! Seu sistema de verificação de email está funcionando! 🎉**

Para mais informações, consulte:
- [README.md](README.md) - Documentação geral
- [INSTALLATION.md](INSTALLATION.md) - Instalação completa

