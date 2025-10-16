# 📁 Estrutura Completa do Projeto

## 🌳 Árvore de Diretórios

```
Trello Nippon/
│
├── 📂 backend/                          # Backend API (Node.js/Express)
│   ├── 📂 config/
│   │   └── db.js                        # ⚙️ Configuração MongoDB
│   │
│   ├── 📂 middleware/
│   │   ├── auth.js                      # 🔐 Middleware de autenticação JWT
│   │   └── upload.js                    # 📎 Middleware de upload Multer
│   │
│   ├── 📂 models/
│   │   ├── User.js                      # 👤 Schema de usuário (Mongoose)
│   │   ├── Task.js                      # ✅ Schema de tarefa (Mongoose)
│   │   └── Comment.js                   # 💬 Schema de comentário (Mongoose)
│   │
│   ├── 📂 routes/
│   │   ├── auth.js                      # 🔑 Rotas de autenticação
│   │   ├── tasks.js                     # 📋 Rotas de tarefas
│   │   └── comments.js                  # 💭 Rotas de comentários
│   │
│   ├── 📂 uploads/                      # 📁 Diretório de uploads (criado automaticamente)
│   │   └── attachments/                 # 🖼️ Anexos das tarefas
│   │
│   ├── .env                             # 🔒 Variáveis de ambiente (não versionado)
│   ├── .env.example                     # 📝 Exemplo de .env
│   ├── .gitignore                       # 🚫 Arquivos ignorados pelo Git
│   ├── package.json                     # 📦 Dependências do backend
│   ├── server.js                        # 🚀 Servidor Express principal
│   └── README.md                        # 📖 Documentação do backend
│
├── 📂 frontend/                         # Frontend Web (Next.js/React)
│   ├── 📂 src/
│   │   ├── 📂 app/                      # 🎯 Pages (Next.js App Router)
│   │   │   ├── 📂 dashboard/
│   │   │   │   └── page.tsx             # 🏠 Dashboard principal
│   │   │   ├── 📂 login/
│   │   │   │   └── page.tsx             # 🔑 Página de login
│   │   │   ├── 📂 register/
│   │   │   │   └── page.tsx             # 📝 Página de registro
│   │   │   ├── layout.tsx               # 🎨 Layout raiz
│   │   │   ├── page.tsx                 # 🏁 Home (redirect)
│   │   │   └── globals.css              # 🎨 Estilos globais
│   │   │
│   │   ├── 📂 components/               # 🧩 Componentes React
│   │   │   ├── AttachmentsSection.tsx   # 📎 Upload e preview de anexos
│   │   │   ├── CalendarView.tsx         # 📅 Visualização de calendário
│   │   │   ├── CreateTaskForm.tsx       # ➕ Formulário de criação
│   │   │   ├── KanbanBoard.tsx          # 📊 Board Kanban principal
│   │   │   ├── KanbanColumn.tsx         # 📋 Coluna do Kanban
│   │   │   ├── Navbar.tsx               # 🧭 Barra de navegação
│   │   │   ├── TaskCard.tsx             # 🎴 Card de tarefa
│   │   │   └── TaskModal.tsx            # 🔍 Modal de detalhes
│   │   │
│   │   ├── 📂 lib/
│   │   │   └── api.ts                   # 🌐 Cliente Axios e endpoints
│   │   │
│   │   ├── 📂 store/                    # 🗄️ Gerenciamento de estado (Zustand)
│   │   │   ├── authStore.ts             # 🔐 State de autenticação
│   │   │   └── tasksStore.ts            # ✅ State de tarefas
│   │   │
│   │   └── 📂 types/
│   │       └── index.ts                 # 📘 Definições TypeScript
│   │
│   ├── 📂 public/                       # 🌍 Assets estáticos
│   │
│   ├── .env.local                       # 🔒 Variáveis de ambiente (não versionado)
│   ├── .env.local.example               # 📝 Exemplo de .env.local
│   ├── .gitignore                       # 🚫 Arquivos ignorados
│   ├── next.config.js                   # ⚙️ Configuração Next.js
│   ├── package.json                     # 📦 Dependências do frontend
│   ├── postcss.config.js                # ⚙️ Configuração PostCSS
│   ├── tailwind.config.ts               # 🎨 Configuração Tailwind CSS
│   ├── tsconfig.json                    # ⚙️ Configuração TypeScript
│   └── README.md                        # 📖 Documentação do frontend
│
├── 📄 README.md                         # 📚 Documentação principal
├── 📄 INSTALLATION.md                   # 📖 Guia de instalação completo
├── 📄 QUICK_START.md                    # ⚡ Quick start
├── 📄 FEATURES.md                       # ✨ Funcionalidades detalhadas
├── 📄 PROJECT_SUMMARY.md                # 📋 Resumo do projeto
├── 📄 STRUCTURE.md                      # 📁 Este arquivo
├── 📄 LICENSE                           # ⚖️ Licença MIT
├── 📄 .gitignore                        # 🚫 Git ignore global
└── 📄 package.json                      # 📦 Scripts raiz
```

## 📊 Estatísticas por Diretório

### Backend
```
Total: 15 arquivos
Código: ~800 linhas
Estrutura:
  - config/     : 1 arquivo
  - middleware/ : 2 arquivos
  - models/     : 3 arquivos
  - routes/     : 3 arquivos
  - raiz/       : 6 arquivos
```

### Frontend
```
Total: 26 arquivos
Código: ~1500 linhas
Estrutura:
  - app/        : 6 arquivos
  - components/ : 8 arquivos
  - lib/        : 1 arquivo
  - store/      : 2 arquivos
  - types/      : 1 arquivo
  - raiz/       : 8 arquivos
```

### Documentação
```
Total: 8 arquivos
Conteúdo: ~1500 linhas
```

## 🔍 Descrição dos Principais Arquivos

### Backend Core

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `server.js` | ~50 | Servidor Express principal, configuração de rotas e middlewares |
| `config/db.js` | ~20 | Conexão com MongoDB usando Mongoose |
| `middleware/auth.js` | ~30 | Verificação de token JWT em rotas protegidas |
| `middleware/upload.js` | ~50 | Configuração Multer para upload de arquivos |
| `models/User.js` | ~40 | Schema de usuário com hash de senha |
| `models/Task.js` | ~60 | Schema de tarefa com anexos e referências |
| `models/Comment.js` | ~25 | Schema de comentário |
| `routes/auth.js` | ~120 | Registro, login, obter usuário |
| `routes/tasks.js` | ~200 | CRUD de tarefas, reordenação, anexos |
| `routes/comments.js` | ~100 | CRUD de comentários |

### Frontend Core

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `app/dashboard/page.tsx` | ~100 | Dashboard principal com toggle Kanban/Calendar |
| `app/login/page.tsx` | ~80 | Página de login |
| `app/register/page.tsx` | ~100 | Página de registro |
| `components/KanbanBoard.tsx` | ~80 | Board Kanban com DnD |
| `components/KanbanColumn.tsx` | ~50 | Coluna do Kanban |
| `components/TaskCard.tsx` | ~70 | Card de tarefa arrastável |
| `components/CalendarView.tsx` | ~120 | Visualização de calendário |
| `components/TaskModal.tsx` | ~300 | Modal completo de detalhes |
| `components/AttachmentsSection.tsx` | ~150 | Upload e preview de anexos |
| `components/CreateTaskForm.tsx` | ~100 | Formulário de nova tarefa |
| `components/Navbar.tsx` | ~40 | Barra de navegação |
| `lib/api.ts` | ~100 | Cliente Axios e endpoints |
| `store/authStore.ts` | ~60 | State de autenticação |
| `store/tasksStore.ts` | ~120 | State de tarefas |
| `types/index.ts` | ~60 | Tipos TypeScript |

## 🎯 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌──────────────┐     ┌────────────┐ │
│  │   Pages     │ ───> │  Components  │ ──> │   Store    │ │
│  │ (App Router)│      │  (React)     │     │  (Zustand) │ │
│  └─────────────┘      └──────────────┘     └────────────┘ │
│         │                    │                     │        │
│         └────────────────────┼─────────────────────┘        │
│                              │                              │
│                              v                              │
│                      ┌───────────────┐                      │
│                      │   API Client  │                      │
│                      │   (Axios)     │                      │
│                      └───────────────┘                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Requests
                               │ (JWT Token)
                               v
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌──────────────┐     ┌────────────┐ │
│  │   Routes    │ ───> │  Middleware  │ ──> │   Models   │ │
│  │  (Express)  │      │  (Auth/Upload)     │ (Mongoose) │ │
│  └─────────────┘      └──────────────┘     └────────────┘ │
│                                                      │      │
│                                                      v      │
│                                              ┌────────────┐ │
│                                              │  MongoDB   │ │
│                                              │ (Database) │ │
│                                              └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Dependências Principais

### Backend (package.json)
```json
{
  "express": "^4.18.2",         // Framework web
  "mongoose": "^8.0.0",         // ODM MongoDB
  "bcryptjs": "^2.4.3",         // Hash de senhas
  "jsonwebtoken": "^9.0.2",     // JWT
  "dotenv": "^16.3.1",          // Variáveis ambiente
  "cors": "^2.8.5",             // CORS
  "multer": "^1.4.5-lts.1",     // Upload files
  "express-validator": "^7.0.1" // Validação
}
```

### Frontend (package.json)
```json
{
  "next": "14.0.4",              // Framework React
  "react": "^18.2.0",            // UI library
  "typescript": "^5.3.3",        // Tipagem
  "tailwindcss": "^3.4.0",       // CSS
  "zustand": "^4.4.7",           // State
  "@dnd-kit/core": "^6.1.0",     // Drag & Drop
  "react-calendar": "^4.7.0",    // Calendário
  "axios": "^1.6.2",             // HTTP client
  "date-fns": "^3.0.0",          // Datas
  "react-dropzone": "^14.2.3",   // File drop
  "react-hot-toast": "^2.4.1"    // Toasts
}
```

## 🗂️ Organização de Código

### Backend - Padrão MVC
```
Model (models/)      - Definição de dados
Routes (routes/)     - Endpoints da API
Controller (routes/) - Lógica de negócio (junto com routes)
Middleware           - Autenticação, Upload
Config               - Configurações (DB)
```

### Frontend - Componentização
```
Pages (app/)         - Rotas da aplicação
Components           - Componentes reutilizáveis
Store                - Estado global
Lib                  - Utilitários (API)
Types                - Definições TypeScript
```

## 🎨 Convenções de Nomenclatura

### Backend
- **Arquivos**: camelCase (auth.js, taskRoutes.js)
- **Models**: PascalCase (User, Task, Comment)
- **Funções**: camelCase (getUserById, createTask)
- **Rotas**: kebab-case (/api/auth/login)

### Frontend
- **Componentes**: PascalCase (KanbanBoard.tsx)
- **Stores**: camelCase + Store (authStore.ts)
- **Tipos**: PascalCase (User, Task)
- **Funções**: camelCase (handleSubmit, fetchTasks)
- **CSS classes**: Tailwind utilities

## 🔄 Ciclo de Vida de uma Request

```
1. User Action (Frontend)
   └─> Click, Form Submit, Drag & Drop

2. Component Handler
   └─> Event handler calls store action

3. Store Action (Zustand)
   └─> Calls API client function

4. API Client (Axios)
   └─> HTTP Request + JWT Token

5. Backend Route (Express)
   └─> Route receives request

6. Middleware Chain
   ├─> CORS check
   ├─> Auth middleware (verify JWT)
   └─> Validation (express-validator)

7. Route Handler
   └─> Business logic execution

8. Model (Mongoose)
   └─> Database operation

9. MongoDB
   └─> Data persistence/retrieval

10. Response
    └─> JSON data back to frontend

11. Store Update
    └─> Update Zustand state

12. Component Re-render
    └─> UI updates automatically
```

## 📈 Escalabilidade

### Backend
```
✅ RESTful API - Fácil de consumir
✅ Middleware modular - Fácil de estender
✅ Mongoose Models - Schema validation
✅ JWT stateless - Horizontal scaling ready
✅ File uploads - Pronto para S3/Cloud Storage
```

### Frontend
```
✅ Component-based - Reutilização
✅ TypeScript - Type safety
✅ Zustand - Performance otimizada
✅ Next.js - SSR/SSG ready
✅ Code splitting - Loading otimizado
```

---

**Estrutura profissional e escalável! 🚀**

