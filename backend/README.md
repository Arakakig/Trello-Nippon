# Trello Nippon - Backend API

API RESTful para sistema de gerenciamento de tarefas estilo Trello.

## Funcionalidades

- Autenticação JWT
- CRUD de tarefas
- Sistema Kanban com drag-and-drop
- Upload de anexos (imagens e PDFs)
- Sistema de comentários
- Atribuição de tarefas a usuários

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- `MONGODB_URI`: URL de conexão do MongoDB
- `JWT_SECRET`: Chave secreta para JWT
- `PORT`: Porta do servidor (padrão: 5000)

3. Inicie o MongoDB (localmente ou use MongoDB Atlas)

4. Execute o servidor:
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual
- `GET /api/auth/users` - Listar todos os usuários

### Tarefas
- `GET /api/tasks` - Listar todas as tarefas
- `GET /api/tasks/:id` - Obter tarefa por ID
- `POST /api/tasks` - Criar nova tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Deletar tarefa
- `POST /api/tasks/reorder` - Reordenar tarefas (Kanban)

### Anexos
- `POST /api/tasks/:id/attachments` - Upload de anexo
- `DELETE /api/tasks/:id/attachments/:attachmentId` - Deletar anexo
- `GET /api/tasks/:id/attachments/:attachmentId/download` - Download de anexo

### Comentários
- `GET /api/comments/task/:taskId` - Listar comentários de uma tarefa
- `POST /api/comments` - Criar comentário
- `PUT /api/comments/:id` - Atualizar comentário
- `DELETE /api/comments/:id` - Deletar comentário

## Estrutura do Projeto

```
backend/
├── config/          # Configurações (DB)
├── middleware/      # Middlewares (auth, upload)
├── models/          # Models do Mongoose
├── routes/          # Rotas da API
├── uploads/         # Arquivos enviados
├── .env.example     # Exemplo de variáveis de ambiente
├── server.js        # Servidor Express
└── package.json     # Dependências
```

## Tecnologias

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Multer (upload de arquivos)
- bcryptjs (hash de senhas)

