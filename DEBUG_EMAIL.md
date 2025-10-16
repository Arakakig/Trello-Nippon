# 🐛 Debug - Verificação de Email

## Problema Atual

1. Banner amarelo não aparece
2. Token dá como expirado

## 🔍 Logs Adicionados

Adicionei logs detalhados no backend. Agora quando você tentar verificar o email, verá no console do backend:

```
🔍 Tentando verificar email com token: abc123...
✅ Usuário encontrado: seu@email.com
📅 Token expira em: 2024-10-17T...
⏰ Data atual: 2024-10-16T...
🔍 Token expirado? false
✅ Email verificado com sucesso!
```

## 🚀 Como Testar Agora

### 1. Reinicie o Backend (IMPORTANTE!)

```powershell
cd backend
npm run dev
```

Observe os logs no terminal.

### 2. Teste com Nova Conta

```powershell
# Em outro terminal, vá para frontend
cd frontend
npm run dev
```

1. Acesse: http://localhost:3000/register
2. Crie uma **nova conta** (use outro email se necessário)
3. Observe os logs no backend - você verá:
   ```
   🔐 Gerando token de verificação...
   📧 Email: novo@email.com
   🎟️ Token: abc123...
   ⏰ Expira em: ...
   ✅ Usuário criado no banco de dados
   📧 Resultado do envio de email: ...
   ```

4. Verifique seu email
5. Clique no link
6. Observe os logs de verificação no backend

### 3. Banner de Email

O banner amarelo agora aparece no **Dashboard** (não apenas no login):

- Vai aparecer no topo do dashboard
- Mostra: "⚠️ Email não verificado"
- Tem botão para reenviar email
- Pode ser dispensado

### 4. Debug do Token

Quando você clicar no link do email, o backend vai logar:

- ✅ Se encontrou o usuário
- ⏰ Quando o token expira
- 🕐 Data atual
- ✅ Se está expirado ou não

Isso vai nos ajudar a entender o problema!

## 🔧 Possíveis Causas do Erro

### 1. Timezone do Servidor
O servidor pode estar em timezone diferente. Os logs vão mostrar isso.

### 2. Token Não Salvou
Pode ser que o token não foi salvo no banco. Os logs vão confirmar.

### 3. Token Muito Curto
Vou aumentar o tempo de expiração para 7 dias para facilitar os testes.

### 4. Email Antigo
Se você está usando um link de email antigo (antes das correções), ele não vai funcionar.

## ✅ Solução Temporária (Enquanto Testamos)

Você pode verificar manualmente no MongoDB:

```javascript
// MongoDB Compass ou Shell
db.users.updateOne(
  { email: "seu@email.com" },
  { $set: { emailVerified: true } }
)
```

## 🎯 Próximos Passos

1. **Reinicie o backend**
2. **Crie uma nova conta** (para gerar novo token)
3. **Observe os logs** no terminal do backend
4. **Tente verificar** o email
5. **Me envie os logs** se ainda não funcionar

---

**Vamos descobrir o problema com os logs! 🔍**

