# Trello Nippon 🎯

Sistema completo de gerenciamento de tarefas estilo Trello, com backend Node.js/Express e frontend Next.js/React.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Funcionalidades

### Core Features
- ✅ **Múltiplos Projetos/Boards** - Organize tarefas em projetos separados
- ✅ **Sistema de Membros** - Adicione membros com diferentes permissões
- ✅ Autenticação JWT segura
- ✅ Quadro Kanban com drag-and-drop
- ✅ Visualização de calendário por data de vencimento
- ✅ Sistema de prioridades (Baixa, Média, Alta)
- ✅ Fluxo de status (A Fazer → Em Progresso → Em Revisão → Concluído)

### Recursos Avançados
- 📎 Upload e gerenciamento de anexos (Imagens e PDFs)
- 💬 Sistema de comentários em tempo real
- 👥 Atribuição de tarefas a múltiplos usuários
- 🔐 **4 níveis de permissão** (Dono, Admin, Membro, Visualizador)
- 📅 Datas de vencimento
- 🖼️ Preview de imagens inline
- 📄 Visualização de PDFs
- 🎨 Interface moderna e responsiva
- 🎨 Personalização de projetos (ícone e cor)

## 🏗️ Arquitetura

```
Trello Nippon/
├── backend/          # API RESTful (Node.js + Express + MongoDB)
│   ├── config/      # Configurações
│   ├── middleware/  # Auth & Upload
│   ├── models/      # Mongoose models
│   ├── routes/      # API endpoints
│   └── server.js    # Entry point
│
├── frontend/        # Interface Web (Next.js + React + TypeScript)
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # React components
│   │   ├── lib/          # API client
│   │   ├── store/        # State management (Zustand)
│   │   └── types/        # TypeScript types
│   └── public/      # Assets estáticos
│
└── README.md        # Você está aqui!
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ e npm
- MongoDB (local ou MongoDB Atlas)
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/trello-nippon.git
cd trello-nippon
```

### 2. Configuração do Backend

```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações:
# - MONGODB_URI: sua URL do MongoDB
# - JWT_SECRET: chave secreta aleatória
# - PORT: 5000 (ou outra porta)

# Inicie o servidor
npm run dev
```

O backend estará rodando em `http://localhost:5000`

### 3. Configuração do Frontend

```bash
cd ../frontend
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 📖 Documentação

### Backend API

#### Autenticação
```
POST /api/auth/register    # Registrar novo usuário
POST /api/auth/login       # Login
GET  /api/auth/me          # Obter usuário atual
GET  /api/auth/users       # Listar usuários
```

#### Projetos (NOVO!)
```
GET    /api/projects                       # Listar projetos
POST   /api/projects                       # Criar projeto
GET    /api/projects/:id                   # Obter projeto
PUT    /api/projects/:id                   # Atualizar projeto
DELETE /api/projects/:id                   # Deletar projeto
POST   /api/projects/:id/members           # Adicionar membro
DELETE /api/projects/:id/members/:userId   # Remover membro
PUT    /api/projects/:id/members/:userId   # Atualizar permissão
```

#### Tarefas
```
GET    /api/tasks              # Listar todas as tarefas
GET    /api/tasks/:id          # Obter tarefa por ID
POST   /api/tasks              # Criar nova tarefa
PUT    /api/tasks/:id          # Atualizar tarefa
DELETE /api/tasks/:id          # Deletar tarefa
POST   /api/tasks/reorder      # Reordenar (drag-and-drop)
```

#### Anexos
```
POST   /api/tasks/:id/attachments                    # Upload
DELETE /api/tasks/:id/attachments/:attachmentId      # Deletar
GET    /api/tasks/:id/attachments/:attachmentId/download  # Download
```

#### Comentários
```
GET    /api/comments/task/:taskId  # Listar comentários
POST   /api/comments               # Criar comentário
PUT    /api/comments/:id           # Atualizar comentário
DELETE /api/comments/:id           # Deletar comentário
```

## 🛠️ Tecnologias

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Multer (upload de arquivos)
- bcryptjs (hash de senhas)

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- @dnd-kit (drag and drop)
- react-calendar
- axios
- date-fns

## 🎨 Screenshots

### Quadro Kanban
Visualização em colunas com drag-and-drop para mover tarefas entre status.

### Calendário
Visualização mensal mostrando tarefas agendadas por data de vencimento.

### Modal de Detalhes
Interface completa para gerenciar todos os aspectos de uma tarefa, incluindo comentários e anexos.

## 🔒 Segurança

- Senhas com hash bcrypt
- Autenticação JWT com tokens de 7 dias
- Validação de entrada com express-validator
- Upload de arquivos com validação de tipo e tamanho
- CORS configurado
- Proteção de rotas no frontend e backend

## 📝 Modelo de Dados

### User
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  avatar?: string
}
```

### Task
```typescript
{
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  assignedTo: User[]
  createdBy: User
  attachments: Attachment[]
  order: number
}
```

### Comment
```typescript
{
  task: Task
  user: User
  text: string
  createdAt: Date
}
```

## 📚 Documentação Completa

Este projeto inclui guias detalhados para ajudá-lo:

1. **[README.md](README.md)** - Visão geral do projeto (você está aqui!)
2. **[INSTALLATION.md](INSTALLATION.md)** - Guia de instalação passo a passo
3. **[QUICK_START.md](QUICK_START.md)** - Início rápido para desenvolvedores
4. **[FEATURES.md](FEATURES.md)** - Lista completa de funcionalidades
5. **[STRUCTURE.md](STRUCTURE.md)** - Estrutura do código e arquitetura
6. **[MULTIPLE_PROJECTS_GUIDE.md](MULTIPLE_PROJECTS_GUIDE.md)** - 🆕 Guia de múltiplos projetos
7. **[UPDATE_SUMMARY.md](UPDATE_SUMMARY.md)** - 🆕 Resumo da atualização v2.0

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Desenvolvido com ❤️ para gerenciamento eficiente de tarefas.

## 🙏 Agradecimentos

- Inspirado no Trello
- Comunidade Next.js
- Comunidade React
- MongoDB University

---

**Trello Nippon** - Gerencie suas tarefas com estilo! 🚀

