# 🔧 Correção - Verificação de Email

## ❌ Problema: "Token de verificação inválido ou expirado"

### Causa
Havia uma incompatibilidade entre como o token estava sendo enviado e como estava sendo recebido no backend.

### ✅ Solução Aplicada

Agora o backend aceita o token como query parameter (`?token=xxx`), que é como o email está enviando.

### 🔄 Para Usuários Existentes

Se você já criou uma conta antes desta correção, você tem 2 opções:

#### Opção 1: Reenviar Email de Verificação

1. Faça **login** normalmente (mesmo sem verificar)
2. Você verá um **banner amarelo** dizendo "Email não verificado"
3. Clique em **"Reenviar email de verificação"**
4. Verifique seu email novamente
5. Clique no novo link

#### Opção 2: Criar Nova Conta

Se preferir, pode criar uma nova conta com outro email.

### 🚀 Próximos Passos

1. **Reinicie o backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Teste com novo registro**:
   - Acesse http://localhost:3000/register
   - Crie uma nova conta
   - Verifique o email
   - Clique no link de verificação
   - Deve funcionar agora! ✅

### 🧪 Verificar se Funcionou

Quando você clicar no link do email, deve ver:

✅ **Tela de Sucesso**:
```
✅ Email Verificado!
Email verificado com sucesso!
Redirecionando para o login...
```

❌ **Se ainda der erro**:
- Verifique se o backend está rodando
- Verifique os logs do backend
- O token pode ter expirado (válido por 24h)

### 📧 Estrutura do Link

O link no email agora está assim:
```
http://localhost:3000/verify-email?token=abc123...
```

E o backend aceita:
```
GET /api/auth/verify-email?token=abc123...
```

### 🐛 Debug

Se ainda tiver problemas, verifique:

1. **Logs do Backend**: O servidor está rodando?
2. **Token Expirado**: Passou mais de 24h desde o cadastro?
3. **Email Configurado**: O email foi enviado corretamente?

### 💾 Verificar no Banco de Dados

Se você tem acesso ao MongoDB, pode verificar:

```javascript
// No MongoDB Compass ou Shell
db.users.find({ email: "seu@email.com" })

// Verifique os campos:
// - emailVerified: deve ser true após verificação
// - verificationToken: deve ser null após verificação
// - verificationTokenExpires: deve ser null após verificação
```

### 🔄 Resetar Verificação Manualmente (Emergência)

Se precisar resetar manualmente no banco:

```javascript
// MongoDB Shell ou Compass
db.users.updateOne(
  { email: "seu@email.com" },
  { 
    $set: { 
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    }
  }
)
```

⚠️ **Use apenas em desenvolvimento!**

---

**A correção foi aplicada! Teste novamente.** 🎉

