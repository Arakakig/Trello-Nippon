# Trello Nippon - Frontend

Interface web moderna para gerenciamento de tarefas estilo Trello, construída com Next.js, React e TypeScript.

## Funcionalidades

### 🎯 Visualizações
- **Kanban Board**: Quadro com drag-and-drop para gerenciar tarefas visualmente
- **Calendário**: Visualização de tarefas por data de vencimento

### ✨ Recursos
- Autenticação JWT com login e registro
- Criação, edição e exclusão de tarefas
- Sistema de prioridades (Baixa, Média, Alta)
- Status personalizados (A Fazer, Em Progresso, Em Revisão, Concluído)
- Atribuição de tarefas a múltiplos usuários
- Sistema de comentários
- Upload de anexos (imagens e PDFs)
- Preview de imagens inline
- Data de vencimento
- Interface responsiva e moderna

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

## Build para Produção

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # Pages do Next.js (App Router)
│   │   ├── dashboard/         # Página principal do dashboard
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Página inicial (redirect)
│   │   └── globals.css        # Estilos globais
│   ├── components/            # Componentes React
│   │   ├── AttachmentsSection.tsx  # Upload e preview de anexos
│   │   ├── CalendarView.tsx        # Visualização de calendário
│   │   ├── CreateTaskForm.tsx      # Formulário de criação
│   │   ├── KanbanBoard.tsx         # Board principal
│   │   ├── KanbanColumn.tsx        # Coluna do Kanban
│   │   ├── Navbar.tsx              # Barra de navegação
│   │   ├── TaskCard.tsx            # Card de tarefa
│   │   └── TaskModal.tsx           # Modal de detalhes
│   ├── lib/                   # Utilitários
│   │   └── api.ts             # Cliente Axios e endpoints
│   ├── store/                 # Gerenciamento de estado (Zustand)
│   │   ├── authStore.ts       # State de autenticação
│   │   └── tasksStore.ts      # State de tarefas
│   └── types/                 # Definições TypeScript
│       └── index.ts           # Interfaces e tipos
├── public/                    # Arquivos estáticos
├── next.config.js             # Configuração do Next.js
├── tailwind.config.ts         # Configuração do Tailwind
└── package.json               # Dependências
```

## Tecnologias

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **Zustand**: Gerenciamento de estado leve
- **@dnd-kit**: Drag and drop acessível
- **react-calendar**: Componente de calendário
- **react-dropzone**: Upload de arquivos
- **axios**: Cliente HTTP
- **date-fns**: Manipulação de datas
- **react-hot-toast**: Notificações

## Componentes Principais

### KanbanBoard
Quadro Kanban com 4 colunas (A Fazer, Em Progresso, Em Revisão, Concluído). Suporta drag-and-drop entre colunas com atualização automática no backend.

### CalendarView
Visualização mensal de tarefas baseada na data de vencimento. Mostra indicadores de tarefas por dia e lista tarefas ao clicar em uma data.

### TaskModal
Modal completo para gerenciar todos os aspectos de uma tarefa:
- Edição de título, descrição, status e prioridade
- Atribuição a usuários
- Upload e visualização de anexos
- Sistema de comentários
- Data de vencimento

### AttachmentsSection
Gerenciamento de anexos com:
- Upload por drag-and-drop
- Preview de imagens
- Download de PDFs
- Validação de tipo e tamanho

## Estado Global

O aplicativo usa Zustand para gerenciamento de estado:

- **authStore**: Autenticação, usuário atual, login/logout
- **tasksStore**: Lista de tarefas, CRUD, seleção de tarefa, anexos

## API Integration

Todas as chamadas de API estão centralizadas em `src/lib/api.ts`:
- Interceptor automático para adicionar JWT
- Redirecionamento automático em caso de token expirado
- Endpoints tipados para auth, tasks e comments

## Customização

### Cores
Edite `tailwind.config.ts` para personalizar o tema de cores.

### Colunas do Kanban
Modifique o array `columns` em `KanbanBoard.tsx` para adicionar/remover colunas.

### Status e Prioridades
Atualize as enums em `src/types/index.ts` e os seletores nos componentes.

