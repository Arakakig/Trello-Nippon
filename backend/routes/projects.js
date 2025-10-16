const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Criar projeto
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Nome é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color, icon } = req.body;

    const project = new Project({
      name,
      description: description || '',
      color: color || '#0ea5e9',
      icon: icon || '📋',
      owner: req.userId,
      members: [{
        user: req.userId,
        role: 'owner'
      }]
    });

    await project.save();
    await project.populate('owner members.user', '-password');

    res.status(201).json(project);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ message: 'Erro ao criar projeto' });
  }
});

// Listar projetos do usuário
router.get('/', auth, async (req, res) => {
  try {
    const { includeArchived } = req.query;
    
    const query = {
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    };

    if (!includeArchived || includeArchived === 'false') {
      query.archived = false;
    }

    const projects = await Project.find(query)
      .populate('owner members.user', '-password')
      .sort({ isDefault: -1, createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ message: 'Erro ao listar projetos' });
  }
});

// Obter projeto por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner members.user', '-password');

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se usuário é membro
    if (!project.isMember(req.userId)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(project);
  } catch (error) {
    console.error('Erro ao obter projeto:', error);
    res.status(500).json({ message: 'Erro ao obter projeto' });
  }
});

// Atualizar projeto
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se usuário pode editar
    if (!project.isAdmin(req.userId)) {
      return res.status(403).json({ message: 'Sem permissão para editar' });
    }

    const { name, description, color, icon, archived } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    if (icon !== undefined) project.icon = icon;
    if (archived !== undefined) project.archived = archived;

    await project.save();
    await project.populate('owner members.user', '-password');

    res.json(project);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ message: 'Erro ao atualizar projeto' });
  }
});

// Deletar projeto
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Apenas o owner pode deletar
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Apenas o dono pode deletar o projeto' });
    }

    // Deletar todas as tarefas do projeto
    await Task.deleteMany({ project: req.params.id });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ message: 'Erro ao deletar projeto' });
  }
});

// Adicionar membro ao projeto
router.post('/:id/members', [
  auth,
  body('userId').notEmpty().withMessage('ID do usuário é obrigatório'),
  body('role').optional().isIn(['admin', 'member', 'viewer']).withMessage('Role inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se usuário é admin
    if (!project.isAdmin(req.userId)) {
      return res.status(403).json({ message: 'Sem permissão para adicionar membros' });
    }

    const { userId, role } = req.body;

    // Verificar se já é membro
    if (project.isMember(userId)) {
      return res.status(400).json({ message: 'Usuário já é membro do projeto' });
    }

    project.members.push({
      user: userId,
      role: role || 'member'
    });

    await project.save();
    await project.populate('owner members.user', '-password');

    res.json(project);
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ message: 'Erro ao adicionar membro' });
  }
});

// Remover membro do projeto
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se usuário é admin
    if (!project.isAdmin(req.userId)) {
      return res.status(403).json({ message: 'Sem permissão para remover membros' });
    }

    // Não pode remover o owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Não é possível remover o dono do projeto' });
    }

    project.members = project.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await project.save();
    await project.populate('owner members.user', '-password');

    res.json(project);
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ message: 'Erro ao remover membro' });
  }
});

// Atualizar role de membro
router.put('/:id/members/:userId', [
  auth,
  body('role').isIn(['admin', 'member', 'viewer']).withMessage('Role inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se usuário é admin
    if (!project.isAdmin(req.userId)) {
      return res.status(403).json({ message: 'Sem permissão para alterar roles' });
    }

    // Não pode alterar role do owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Não é possível alterar role do dono' });
    }

    const member = project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ message: 'Membro não encontrado' });
    }

    member.role = req.body.role;
    await project.save();
    await project.populate('owner members.user', '-password');

    res.json(project);
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    res.status(500).json({ message: 'Erro ao atualizar role' });
  }
});

// Criar projeto padrão para novo usuário (helper)
router.post('/create-default', auth, async (req, res) => {
  try {
    // Verificar se já tem projeto padrão
    const existingDefault = await Project.findOne({ 
      owner: req.userId, 
      isDefault: true 
    });

    if (existingDefault) {
      return res.json(existingDefault);
    }

    const defaultProject = new Project({
      name: 'Meu Primeiro Projeto',
      description: 'Projeto padrão criado automaticamente',
      color: '#0ea5e9',
      icon: '🚀',
      owner: req.userId,
      isDefault: true,
      members: [{
        user: req.userId,
        role: 'owner'
      }]
    });

    await defaultProject.save();
    await defaultProject.populate('owner members.user', '-password');

    res.status(201).json(defaultProject);
  } catch (error) {
    console.error('Erro ao criar projeto padrão:', error);
    res.status(500).json({ message: 'Erro ao criar projeto padrão' });
  }
});

module.exports = router;

