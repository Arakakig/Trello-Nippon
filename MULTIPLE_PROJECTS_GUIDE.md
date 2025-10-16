# 📚 Guia de Múltiplos Projetos - Trello Nippon

## 🎉 Nova Funcionalidade Adicionada!

O Trello Nippon agora suporta **múltiplos projetos/boards**! Você pode organizar suas tarefas em diferentes projetos separados, cada um com seus próprios membros e permissões.

## ✨ Novas Funcionalidades

### 1. Projetos Separados
- Crie quantos projetos quiser
- Cada projeto tem seu próprio nome, ícone e cor
- Tarefas organizadas por projeto
- Projeto padrão criado automaticamente no primeiro acesso

### 2. Sistema de Membros
- Adicione membros aos seus projetos
- 4 níveis de permissão:
  - **Dono**: Controle total (criar, editar, deletar projeto, gerenciar membros)
  - **Admin**: Gerenciar membros e todas as tarefas
  - **Membro**: Criar e editar tarefas
  - **Visualizador**: Apenas visualização

### 3. Gerenciamento Visual
- Seletor de projetos no dashboard
- Modal de configurações do projeto
- Adicionar/remover membros facilmente
- Editar permissões de membros

## 🚀 Como Usar

### Criar um Novo Projeto

1. Clique no **seletor de projetos** (ao lado do título "Minhas Tarefas")
2. Clique em **"Novo Projeto"** no menu dropdown
3. Preencha:
   - Nome do projeto
   - Descrição (opcional)
   - Escolha um ícone
   - Escolha uma cor
4. Clique em **"Criar Projeto"**

### Trocar Entre Projetos

1. Clique no **seletor de projetos**
2. Selecione o projeto desejado
3. O Kanban e Calendário serão atualizados automaticamente

### Gerenciar Membros

1. Clique em **"Configurações"** no menu superior (ícone de engrenagem)
2. Na seção **"Membros"**:
   - Veja todos os membros atuais
   - Altere permissões usando o dropdown
   - Remova membros clicando no X
3. Para adicionar membros:
   - Selecione um usuário disponível
   - Escolha a permissão
   - Clique em **"Adicionar"**

### Editar Projeto

1. Clique em **"Configurações"**
2. Clique em **"Editar Projeto"**
3. Altere nome, descrição, ícone ou cor
4. Clique em **"Salvar"**

### Deletar Projeto

⚠️ **ATENÇÃO**: Esta ação é irreversível!

1. Clique em **"Configurações"**
2. Clique em **"Deletar Projeto"** (apenas o dono pode fazer isso)
3. Confirme a ação
4. Todas as tarefas do projeto serão removidas permanentemente

## 📋 Mudanças no Sistema

### Backend

#### Novo Model: Project
```javascript
{
  name: String,
  description: String,
  color: String,
  icon: String,
  owner: User,
  members: [{ user, role, addedAt }],
  isDefault: Boolean,
  archived: Boolean
}
```

#### Model Task Atualizado
- Novo campo: `project` (referência ao Project)
- Todas as tarefas agora pertencem a um projeto

#### Novas Rotas API
```
GET    /api/projects              # Listar projetos
POST   /api/projects              # Criar projeto
GET    /api/projects/:id          # Obter projeto
PUT    /api/projects/:id          # Atualizar projeto
DELETE /api/projects/:id          # Deletar projeto
POST   /api/projects/:id/members  # Adicionar membro
DELETE /api/projects/:id/members/:userId  # Remover membro
PUT    /api/projects/:id/members/:userId  # Atualizar permissão
POST   /api/projects/create-default  # Criar projeto padrão
```

### Frontend

#### Novos Componentes
- `ProjectSelector.tsx` - Seletor de projetos
- `CreateProjectModal.tsx` - Modal de criar/editar projeto
- `ProjectSettings.tsx` - Configurações e membros

#### Store Atualizado
- `projectsStore.ts` - Gerenciamento de estado dos projetos
- `tasksStore.ts` - Atualizado para filtrar por projeto

#### Componentes Atualizados
- `KanbanBoard` - Filtra tarefas por projeto selecionado
- `CalendarView` - Filtra tarefas por projeto selecionado
- `CreateTaskForm` - Associa tarefa ao projeto atual
- `Dashboard` - Integração com seletor de projetos
- `Navbar` - Botão de configurações do projeto

## 🔄 Migração de Dados Existentes

Se você já tinha tarefas antes desta atualização:

1. **Backend**: As tarefas antigas precisarão ter um projeto associado
2. Um projeto padrão é criado automaticamente
3. Você pode precisar associar tarefas antigas ao projeto padrão manualmente

### Script de Migração (Opcional)

Se você tem tarefas existentes no banco de dados, execute este script no MongoDB:

```javascript
// Criar projeto padrão para cada usuário
db.users.find().forEach(function(user) {
  // Criar projeto padrão
  var projectId = ObjectId();
  db.projects.insert({
    _id: projectId,
    name: "Meu Projeto",
    description: "Projeto padrão",
    color: "#0ea5e9",
    icon: "📋",
    owner: user._id,
    members: [{
      user: user._id,
      role: "owner",
      addedAt: new Date()
    }],
    isDefault: true,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Associar tarefas ao projeto
  db.tasks.updateMany(
    { createdBy: user._id, project: { $exists: false } },
    { $set: { project: projectId } }
  );
});
```

## 💡 Casos de Uso

### Uso Individual
- **Projeto "Pessoal"**: Tarefas do dia a dia
- **Projeto "Trabalho"**: Tarefas profissionais
- **Projeto "Estudos"**: Cursos e aprendizado

### Uso em Equipe
- **Projeto "Frontend"**: Equipe de frontend
- **Projeto "Backend"**: Equipe de backend
- **Projeto "Design"**: Equipe de design
- Cada projeto com membros específicos e permissões adequadas

### Uso por Cliente
- **Projeto "Cliente A"**: Tarefas do cliente A
- **Projeto "Cliente B"**: Tarefas do cliente B
- Adicione clientes como visualizadores para acompanhamento

## 🎨 Personalização

### Ícones Disponíveis
📋 🚀 💼 🎯 📊 🎨 💡 ⚡ 🔥 ⭐ 🌟 🎉

### Cores Disponíveis
- Azul (#0ea5e9)
- Verde (#10b981)
- Roxo (#8b5cf6)
- Rosa (#ec4899)
- Laranja (#f97316)
- Vermelho (#ef4444)
- Amarelo (#f59e0b)
- Índigo (#6366f1)

## 🔐 Segurança e Permissões

### Verificações de Segurança
- ✅ Apenas membros podem ver o projeto
- ✅ Apenas admin/dono pode adicionar membros
- ✅ Apenas dono pode deletar projeto
- ✅ Permissões validadas no backend

### Boas Práticas
1. Crie projetos separados para diferentes equipes
2. Use permissão "viewer" para stakeholders
3. Faça backup antes de deletar projetos
4. Revise membros periodicamente

## 📝 Exemplos de Fluxo

### Criar Projeto para Equipe

1. Criar projeto "Desenvolvimento Web"
2. Adicionar desenvolvedores como "membros"
3. Adicionar gerente como "admin"
4. Adicionar cliente como "visualizador"
5. Criar tarefas no projeto
6. Atribuir tarefas aos membros

### Organizar Projetos Pessoais

1. Criar projeto "🏠 Casa"
2. Criar projeto "💼 Trabalho"
3. Criar projeto "🎓 Estudos"
4. Trocar entre projetos conforme contexto
5. Visualizar tarefas no calendário por projeto

## 🆕 Próximas Melhorias (Sugestões)

- [ ] Arquivar projetos
- [ ] Templates de projeto
- [ ] Duplicar projeto
- [ ] Estatísticas por projeto
- [ ] Filtros avançados
- [ ] Notificações por projeto
- [ ] Exportar projeto
- [ ] Tags personalizadas por projeto

## 🐛 Troubleshooting

### Não consigo ver minhas tarefas antigas
- Verifique se as tarefas têm um projeto associado
- Execute o script de migração acima
- Ou recrie as tarefas manualmente

### Erro ao criar projeto
- Verifique se o backend está rodando
- Verifique se está autenticado
- Veja os logs do console

### Não consigo adicionar membros
- Verifique se você é dono ou admin
- Verifique se o usuário já não é membro
- Verifique se o usuário existe

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Verifique o console do browser (F12)
3. Leia a documentação do INSTALLATION.md
4. Verifique se todas as dependências estão atualizadas

---

**Aproveite a nova funcionalidade de múltiplos projetos! 🎉**

