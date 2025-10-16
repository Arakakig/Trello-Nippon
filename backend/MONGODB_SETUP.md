# 🔧 Configuração MongoDB Atlas

## Sua Connection String

```
mongodb+srv://admin:<db_password>@trello.addxhjn.mongodb.net/?retryWrites=true&w=majority&appName=Trello
```

## ⚙️ Como Configurar

### Passo 1: Substitua `<db_password>` pela senha real

A connection string deve ficar assim (com sua senha real):
```
mongodb+srv://admin:SUA_SENHA_AQUI@trello.addxhjn.mongodb.net/?retryWrites=true&w=majority&appName=Trello
```

**⚠️ IMPORTANTE**: Se sua senha contém caracteres especiais como `@`, `#`, `$`, etc., você precisa codificá-los em URL:

| Caractere | Codificado |
|-----------|------------|
| @         | %40        |
| #         | %23        |
| $         | %24        |
| %         | %25        |
| &         | %26        |

Exemplo: Se sua senha é `Minha@Senha#123`, use `Minha%40Senha%23123`

### Passo 2: Adicione o nome do banco de dados

Adicione `/trello-nippon` após `.net`:
```
mongodb+srv://admin:SUA_SENHA_AQUI@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
```

### Passo 3: Configure o arquivo .env

Crie ou edite o arquivo `.env` na pasta `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:SUA_SENHA_AQUI@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
JWT_SECRET=trello_nippon_super_secret_jwt_key_2024_change_in_production
NODE_ENV=development
```

## 🎯 Exemplo Completo

Se sua senha do MongoDB Atlas é `MyPass123`, seu arquivo `.env` ficaria assim:

```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:MyPass123@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello
JWT_SECRET=trello_nippon_super_secret_jwt_key_2024_change_in_production
NODE_ENV=development
```

## ✅ Teste a Conexão

Após configurar, execute:

```bash
cd backend
npm install
npm run dev
```

Se tudo estiver correto, você verá:
```
MongoDB conectado com sucesso
Servidor rodando na porta 5000
```

## 🔒 Configurações de Segurança no Atlas

### 1. Network Access (IP Whitelist)

No MongoDB Atlas, você precisa permitir o acesso do seu IP:

1. Vá em **Network Access** no menu lateral
2. Clique em **Add IP Address**
3. Escolha uma das opções:
   - **Add Current IP Address** (para seu IP atual)
   - **Allow Access from Anywhere** (`0.0.0.0/0`) - útil para desenvolvimento, mas **não recomendado para produção**

### 2. Database User

Certifique-se de que o usuário `admin` foi criado com senha correta:

1. Vá em **Database Access** no menu lateral
2. Verifique se o usuário `admin` existe
3. Se necessário, clique em **Edit** para redefinir a senha
4. Certifique-se de que o usuário tem permissão **Read and write to any database**

## 🐛 Solução de Problemas

### Erro: "MongoServerError: bad auth"
**Solução**: Senha incorreta. Verifique a senha do usuário `admin` no Atlas.

### Erro: "MongoNetworkError: connection timed out"
**Solução**: Seu IP não está na whitelist. Adicione em Network Access.

### Erro: "SSL routines"
**Solução**: Certifique-se de usar `mongodb+srv://` (com o `srv`).

### Erro: "Authentication failed"
**Solução**: Codifique caracteres especiais na senha (veja tabela acima).

## 📝 Checklist de Configuração

- [ ] Senha substituída em `<db_password>`
- [ ] Caracteres especiais codificados (se necessário)
- [ ] Nome do database `/trello-nippon` adicionado
- [ ] Arquivo `.env` criado na pasta `backend/`
- [ ] IP adicionado na whitelist do Atlas
- [ ] Usuário `admin` existe e tem permissões
- [ ] `npm install` executado
- [ ] `npm run dev` executado sem erros
- [ ] Mensagem "MongoDB conectado com sucesso" apareceu

## 🚀 Próximos Passos

Depois que o backend estiver conectado ao MongoDB:

1. Abra outro terminal
2. Configure o frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Acesse http://localhost:3000
4. Crie sua conta e comece a usar!

---

**Precisa de ajuda? Verifique o arquivo INSTALLATION.md na raiz do projeto! 📖**

