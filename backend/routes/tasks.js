const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { parseDateFromFrontend } = require('../utils/dateUtils');
const fs = require('fs');
const path = require('path');

// Criar tarefa
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Título é obrigatório'),
  body('projectId').notEmpty().withMessage('ID do projeto é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      assignedTo, 
      projectId,
      isRecurring,
      recurringType,
      recurringDays,
      recurringEndDate
    } = req.body;

    const task = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: parseDateFromFrontend(dueDate),
      assignedTo: assignedTo || [],
      project: projectId,
      createdBy: req.userId,
      isRecurring: Boolean(isRecurring),
      recurringType: isRecurring ? recurringType : null,
      recurringDays: isRecurring ? (recurringDays || []) : [],
      recurringEndDate: isRecurring ? parseDateFromFrontend(recurringEndDate) : null
    });

    await task.save();
    await task.populate('createdBy assignedTo project', '-password');

    // Se for uma tarefa recorrente, gerar as instâncias futuras
    if (isRecurring && recurringType === 'weekly' && recurringDays.length > 0) {
      await generateRecurringTasks(task);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Erro ao criar tarefa' });
  }
});

// Listar todas as tarefas (com filtro opcional por projeto)
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const query = {};
    if (projectId) {
      query.project = projectId;
    }

    const tasks = await Task.find(query)
      .populate('createdBy assignedTo project', '-password')
      .sort({ order: 1, createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ message: 'Erro ao listar tarefas' });
  }
});

// Obter tarefa por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy assignedTo project', '-password')
      .populate('attachments.uploadedBy', '-password');

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    res.json(task);
  } catch (error) {
    console.error('Erro ao obter tarefa:', error);
    res.status(500).json({ message: 'Erro ao obter tarefa' });
  }
});

// Atualizar tarefa
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Atualizar campos
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = parseDateFromFrontend(dueDate);
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();
    await task.populate('createdBy assignedTo project', '-password');

    res.json(task);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa' });
  }
});

// Atualizar ordem das tarefas (para Kanban drag and drop)
router.post('/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body; // Array de { id, status, order }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Formato inválido' });
    }

    // Atualizar cada tarefa
    const updatePromises = tasks.map(async ({ id, status, order }) => {
      return Task.findByIdAndUpdate(id, { status, order }, { new: true });
    });

    await Promise.all(updatePromises);

    // Retornar todas as tarefas atualizadas
    const allTasks = await Task.find()
      .populate('createdBy assignedTo project', '-password')
      .sort({ order: 1, createdAt: -1 });

    res.json(allTasks);
  } catch (error) {
    console.error('Erro ao reordenar tarefas:', error);
    res.status(500).json({ message: 'Erro ao reordenar tarefas' });
  }
});

// Deletar tarefa
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Deletar anexos do sistema de arquivos
    task.attachments.forEach(attachment => {
      const filePath = path.join(__dirname, '..', attachment.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ message: 'Erro ao deletar tarefa' });
  }
});

// Upload de anexo
router.post('/:id/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      // Deletar arquivo se tarefa não existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.userId
    };

    task.attachments.push(attachment);
    await task.save();
    await task.populate('attachments.uploadedBy', '-password');

    res.json(task);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    // Deletar arquivo em caso de erro
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Erro ao fazer upload do arquivo' });
  }
});

// Deletar anexo
router.delete('/:id/attachments/:attachmentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    // Deletar arquivo do sistema de arquivos
    const filePath = path.join(__dirname, '..', attachment.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    attachment.deleteOne();
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Erro ao deletar anexo:', error);
    res.status(500).json({ message: 'Erro ao deletar anexo' });
  }
});

// Download de anexo
router.get('/:id/attachments/:attachmentId/download', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    const filePath = path.join(__dirname, '..', attachment.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    res.download(filePath, attachment.originalName);
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ message: 'Erro ao fazer download do arquivo' });
  }
});

// Função para gerar tarefas recorrentes
async function generateRecurringTasks(parentTask) {
  try {
    const { recurringDays, recurringEndDate, dueDate } = parentTask;
    const endDate = recurringEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 dias se não especificado
    const startDate = dueDate ? new Date(dueDate) : new Date();
    
    const tasks = [];
    const currentDate = new Date(startDate);
    
    // Gerar tarefas para as próximas 12 semanas
    for (let week = 0; week < 12; week++) {
      for (const dayOfWeek of recurringDays) {
        const taskDate = new Date(currentDate);
        taskDate.setDate(currentDate.getDate() + (dayOfWeek - currentDate.getDay()) + (week * 7));
        
        // Verificar se a data não passou do limite
        if (taskDate > endDate) break;
        
        // Verificar se a data não é no passado
        if (taskDate < new Date()) continue;
        
        // Criar nova tarefa
        const recurringTask = new Task({
          title: parentTask.title,
          description: parentTask.description,
          status: 'todo',
          priority: parentTask.priority,
          dueDate: taskDate,
          assignedTo: parentTask.assignedTo,
          project: parentTask.project,
          createdBy: parentTask.createdBy,
          isRecurring: false, // Esta é uma instância específica
          parentTask: parentTask._id
        });
        
        tasks.push(recurringTask);
      }
    }
    
    if (tasks.length > 0) {
      await Task.insertMany(tasks);
      console.log(`Geradas ${tasks.length} tarefas recorrentes para a tarefa ${parentTask._id}`);
    }
  } catch (error) {
    console.error('Erro ao gerar tarefas recorrentes:', error);
  }
}

module.exports = router;

