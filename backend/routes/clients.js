const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const { processFile, cleanupFile } = require('../utils/fileProcessor');

// GET /api/clients - Buscar todos os clientes do usuário
router.get('/', auth, async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;

    let query = { owner: req.user.id };
    if (projectId) {
      query.project = projectId;
    }

    // Filtro por data de adesão
    if (startDate || endDate) {
      query.adhesionDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Início do dia
        query.adhesionDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Final do dia
        query.adhesionDate.$lte = end;
      }
    }

    const clients = await Client.find(query)
      .populate('project', 'name color icon')
      .populate('vendor', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/clients/:id - Buscar cliente específico
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('project', 'name color icon')
      .populate('vendor', 'name email phone');

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/clients - Criar novo cliente
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      contract,
      adhesionDate,
      contractDate,
      dueDate,
      plan,
      observation,
      adhesionValue,
      paymentMethod,
      confirmation,
      homeVisit,
      origin,
      vendor,
      paid,
      listMonth,
      listYear,
      projectId
    } = req.body;

    // Validar campos obrigatórios
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Telefone é obrigatório' });
    }

    // Verificar se o projeto existe e pertence ao usuário
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Validar datas antes de converter
    const validateDate = (dateValue) => {
      if (!dateValue) return null;
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    };

    const client = new Client({
      name,
      phone,
      contract,
      adhesionDate: validateDate(adhesionDate),
      contractDate: validateDate(contractDate),
      dueDate: validateDate(dueDate),
      plan,
      observation: observation || '',
      adhesionValue: parseFloat(adhesionValue) || 0,
      paymentMethod,
      confirmation,
      homeVisit: Boolean(homeVisit),
      origin,
      vendor: vendor || null,
      paid: Boolean(paid),
      listMonth: listMonth || new Date().toLocaleDateString('pt-BR', { month: 'long' }),
      listYear: listYear || new Date().getFullYear(),
      owner: req.user.id,
      project: projectId
    });

    await client.save();
    await client.populate('project', 'name color icon')
      .populate('vendor', 'name email phone');

    res.status(201).json(client);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      contract,
      adhesionDate,
      contractDate,
      dueDate,
      plan,
      observation,
      adhesionValue,
      paymentMethod,
      confirmation,
      homeVisit,
      origin,
      vendor,
      paid,
      listMonth,
      listYear
    } = req.body;

    // Validar campos obrigatórios
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Telefone é obrigatório' });
    }

    // Validar datas antes de converter
    const validateDate = (dateValue) => {
      if (!dateValue) return null;
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    };

    const updateData = {
      name,
      phone,
      contract,
      plan,
      observation: observation || '',
      adhesionValue: parseFloat(adhesionValue) || 0,
      paymentMethod,
      confirmation,
      homeVisit: Boolean(homeVisit),
      origin,
      vendor: vendor || null,
      paid: Boolean(paid),
      listMonth: listMonth || '',
      listYear: listYear || new Date().getFullYear()
    };

    // Adicionar datas apenas se forem válidas
    const validAdhesionDate = validateDate(adhesionDate);
    const validContractDate = validateDate(contractDate);
    const validDueDate = validateDate(dueDate);

    if (validAdhesionDate) updateData.adhesionDate = validAdhesionDate;
    if (validContractDate) updateData.contractDate = validContractDate;
    if (validDueDate) updateData.dueDate = validDueDate;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('project', 'name color icon')
      .populate('vendor', 'name email phone');

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/clients/import/preview - Preview da importação
router.post('/import/preview', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const { columnMapping } = req.body;
    let mapping;

    try {
      mapping = JSON.parse(columnMapping);
    } catch (error) {
      return res.status(400).json({ message: 'Mapeamento de colunas inválido' });
    }

    // Buscar vendedores do usuário para mapeamento
    const vendors = await Vendor.find({ owner: req.user.id, active: true });

    const result = await processFile(req.file.path, mapping, vendors);

    // Limpar arquivo temporário
    cleanupFile(req.file.path);

    res.json(result);
  } catch (error) {
    console.error('Erro ao processar preview da importação:', error);
      if (req.file) {
        cleanupFile(req.file.path);
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/clients/import - Importar clientes
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const { columnMapping, projectId } = req.body;
    let mapping;

    try {
      mapping = JSON.parse(columnMapping);
    } catch (error) {
      return res.status(400).json({ message: 'Mapeamento de colunas inválido' });
    }

    // Verificar se o projeto existe e pertence ao usuário
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Buscar vendedores do usuário para mapeamento
    const vendors = await Vendor.find({ owner: req.user.id, active: true });

    const result = await processFile(req.file.path, mapping, vendors);

    // Limpar arquivo temporário
    cleanupFile(req.file.path);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Filtrar apenas dados válidos (com nome e telefone)
    const validClients = result.data.filter(clientData => 
      clientData.name && clientData.name.trim() && 
      clientData.phone && clientData.phone.trim()
    );

    const invalidClients = result.data.filter(clientData => 
      !clientData.name || !clientData.name.trim() || 
      !clientData.phone || !clientData.phone.trim()
    );

    // Criar clientes válidos
    const clients = [];
    for (const clientData of validClients) {
      console.log(clientData)
      const client = new Client({
        ...clientData,
        owner: req.user.id,
        project: projectId,
        // Se não especificado, usar mês/ano atual
        listMonth: clientData.listMonth || new Date().toLocaleDateString('pt-BR', { month: 'long' }),
        listYear: clientData.listYear || new Date().getFullYear()
      });

      await client.save();
      await client.populate([
        { path: 'project', select: 'name color icon' },
        { path: 'vendor', select: 'name email phone' }
      ]);

      clients.push(client);
    }

    res.status(201).json({
      message: `${clients.length} clientes importados com sucesso`,
      clients: clients,
      summary: {
        totalRows: result.totalRows,
        validClients: validClients.length,
        invalidClients: invalidClients.length,
        imported: clients.length,
        skipped: invalidClients.length,
        errors: result.errors.length
      },
      invalidClients: invalidClients.map((client, index) => ({
        row: index + 1,
        reason: !client.name || !client.name.trim() ? 'Nome obrigatório' : 'Telefone obrigatório',
        data: client
      }))
    });
  } catch (error) {
    console.error('Erro ao importar clientes:', error);
    if (req.file) {
      cleanupFile(req.file.path);
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/clients/bulk-create - Criar múltiplos clientes
router.post('/bulk-create', auth, async (req, res) => {
  try {
    const { clients, projectId } = req.body;

    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({ message: 'Lista de clientes inválida' });
    }

    // Verificar se o projeto existe e pertence ao usuário
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    const createdClients = [];
    const errors = [];

    for (let i = 0; i < clients.length; i++) {
      try {
        const clientData = clients[i];
        const client = new Client({
          ...clientData,
          owner: req.user.id,
          project: projectId,
          // Se não especificado, usar mês/ano atual
          listMonth: clientData.listMonth || new Date().toLocaleDateString('pt-BR', { month: 'long' }),
          listYear: clientData.listYear || new Date().getFullYear()
        });

        await client.save();
        await client.populate([
          { path: 'project', select: 'name color icon' },
          { path: 'vendor', select: 'name email phone' }
        ]);

        createdClients.push(client);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          data: clients[i]
        });
      }
    }

    res.status(201).json({
      message: `${createdClients.length} clientes criados com sucesso`,
      clients: createdClients,
      errors: errors,
      summary: {
        total: clients.length,
        created: createdClients.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Erro ao criar clientes em lote:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
