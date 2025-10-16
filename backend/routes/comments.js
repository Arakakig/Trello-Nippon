const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Criar comentário
router.post('/', [
  auth,
  body('taskId').notEmpty().withMessage('ID da tarefa é obrigatório'),
  body('text').trim().notEmpty().withMessage('Texto do comentário é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId, text } = req.body;

    // Verificar se a tarefa existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    const comment = new Comment({
      task: taskId,
      user: req.userId,
      text
    });

    await comment.save();
    await comment.populate('user', '-password');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ message: 'Erro ao criar comentário' });
  }
});

// Listar comentários de uma tarefa
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', '-password')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ message: 'Erro ao listar comentários' });
  }
});

// Atualizar comentário
router.put('/:id', [
  auth,
  body('text').trim().notEmpty().withMessage('Texto do comentário é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    // Verificar se o usuário é o autor
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    comment.text = req.body.text;
    await comment.save();
    await comment.populate('user', '-password');

    res.json(comment);
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ message: 'Erro ao atualizar comentário' });
  }
});

// Deletar comentário
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    // Verificar se o usuário é o autor
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({ message: 'Erro ao deletar comentário' });
  }
});

module.exports = router;

