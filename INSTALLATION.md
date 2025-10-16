# Guia de Instalação Completo - Trello Nippon

Este guia irá ajudá-lo a configurar e executar o Trello Nippon do zero.

## 📋 Pré-requisitos

### 1. Instalar Node.js
- Baixe e instale o Node.js 18+ de [nodejs.org](https://nodejs.org/)
- Verifique a instalação:
```bash
node --version
npm --version
```

### 2. Instalar MongoDB

#### Opção A: MongoDB Local (Windows)
1. Baixe o MongoDB Community Server em [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Execute o instalador e siga as instruções
3. Inicie o MongoDB:
```bash
# Windows (como serviço)
net start MongoDB

# Ou execute manualmente
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

#### Opção B: MongoDB Atlas (Cloud - Recomendado para iniciantes)
1. Crie uma conta gratuita em [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Clique em "Connect" → "Connect your application"
4. Copie a connection string (será usado no passo de configuração)

## 🚀 Instalação Passo a Passo

### Passo 1: Clonar/Baixar o Projeto

Se você tem o Git instalado:
```bash
git clone <url-do-repositorio>
cd "Trello Nippon"
```

Ou baixe o ZIP e extraia para uma pasta.

### Passo 2: Configurar o Backend

1. Abra um terminal na pasta do projeto e navegue até o backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. O arquivo `.env` já está configurado para MongoDB local. Se você usar MongoDB Atlas, edite:
```
PORT=5000
MONGODB_URI=sua_connection_string_do_atlas_aqui
JWT_SECRET=trello_nippon_super_secret_jwt_key_2024_change_in_production
NODE_ENV=development
```

4. Inicie o servidor backend:
```bash
npm run dev
```

Você deve ver:
```
Servidor rodando na porta 5000
MongoDB conectado com sucesso
```

✅ **Backend está funcionando!** Mantenha este terminal aberto.

### Passo 3: Configurar o Frontend

1. Abra um **NOVO terminal** (mantenha o backend rodando)

2. Navegue até a pasta frontend:
```bash
cd frontend
```

3. Instale as dependências:
```bash
npm install
```

**Nota**: Esta instalação pode demorar alguns minutos.

4. O arquivo `.env.local` já está configurado. Se seu backend estiver em outra porta, edite:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Inicie o servidor frontend:
```bash
npm run dev
```

Você deve ver:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

✅ **Frontend está funcionando!**

### Passo 4: Acessar a Aplicação

1. Abra seu navegador em: **http://localhost:3000**

2. Você verá a página de login. Clique em "Registre-se"

3. Crie sua conta:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: mínimo 6 caracteres

4. Após o registro, você será automaticamente logado e redirecionado para o dashboard!

## 🎯 Primeiros Passos

### Criar sua primeira tarefa

1. No dashboard, clique em **"Nova Tarefa"**
2. Preencha:
   - Título: "Minha primeira tarefa"
   - Descrição: "Testando o Trello Nippon"
   - Prioridade: Média
   - Data de vencimento: escolha uma data
3. Clique em "Criar Tarefa"

### Usar o Kanban

1. Sua tarefa aparecerá na coluna "A Fazer"
2. **Arraste e solte** a tarefa para outras colunas
3. Clique na tarefa para abrir o modal de detalhes

### Explorar recursos

No modal de detalhes você pode:
- ✏️ Editar título, descrição, status e prioridade
- 👥 Atribuir a tarefa a usuários
- 📎 Fazer upload de imagens e PDFs
- 💬 Adicionar comentários
- 🗓️ Definir data de vencimento

### Ver no Calendário

1. Clique no botão **"Calendário"** no topo
2. Veja suas tarefas organizadas por data de vencimento
3. Clique em uma data para ver tarefas daquele dia
4. Clique em uma tarefa para abrir os detalhes

## 🔧 Solução de Problemas

### Erro: "Cannot connect to MongoDB"

**Solução**:
- Verifique se o MongoDB está rodando
- Windows: `net start MongoDB`
- Verifique a MONGODB_URI no arquivo `.env`

### Erro: "Port 3000 already in use"

**Solução**:
```bash
# Mate o processo na porta 3000 ou use outra porta
npm run dev -- -p 3001
```

### Erro: "ECONNREFUSED" no frontend

**Solução**:
- Verifique se o backend está rodando na porta 5000
- Verifique o arquivo `.env.local` do frontend

### Erro de dependências ao instalar

**Solução**:
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Backend não conecta ao MongoDB Atlas

**Solução**:
1. Verifique se seu IP está na whitelist do Atlas
2. Verifique se a senha na connection string está correta
3. Certifique-se de que a connection string está entre aspas no .env

## 📝 Scripts Úteis

### Backend
```bash
npm run dev      # Modo desenvolvimento (com nodemon)
npm start        # Modo produção
```

### Frontend
```bash
npm run dev      # Modo desenvolvimento
npm run build    # Build para produção
npm start        # Servidor produção (após build)
npm run lint     # Verificar erros
```

## 🎓 Próximos Passos

1. **Criar mais tarefas** e experimentar o drag-and-drop
2. **Convidar usuários** (registre mais contas para testar atribuições)
3. **Fazer upload de arquivos** (imagens e PDFs)
4. **Adicionar comentários** nas tarefas
5. **Explorar a visualização de calendário**

## 💡 Dicas

- **Múltiplos usuários**: Abra uma janela anônima para criar outra conta
- **Responsividade**: Teste em telas diferentes (mobile, tablet, desktop)
- **Atalhos**: Clique em qualquer lugar fora do modal para fechá-lo
- **Calendário**: Dias com tarefas mostram um ponto azul

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs nos terminais (backend e frontend)
2. Verifique o console do navegador (F12 → Console)
3. Certifique-se de que ambos os servidores estão rodando
4. Verifique se todas as dependências foram instaladas corretamente

---

## ✅ Checklist de Instalação

- [ ] Node.js instalado
- [ ] MongoDB instalado/configurado
- [ ] Backend: dependências instaladas (`npm install`)
- [ ] Backend: arquivo `.env` configurado
- [ ] Backend: servidor rodando (porta 5000)
- [ ] Frontend: dependências instaladas (`npm install`)
- [ ] Frontend: arquivo `.env.local` configurado
- [ ] Frontend: servidor rodando (porta 3000)
- [ ] Navegador aberto em http://localhost:3000
- [ ] Conta criada e login realizado
- [ ] Primeira tarefa criada com sucesso

**Parabéns! 🎉 Seu Trello Nippon está funcionando!**

