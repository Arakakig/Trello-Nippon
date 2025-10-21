const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ColdList = require('../models/ColdList');
const Task = require('../models/Task');
const Vendor = require('../models/Vendor');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const excelUpload = require('../middleware/excelUpload');
const { processFile, cleanupFile } = require('../utils/fileProcessor');
const { parseDateFromFrontend } = require('../utils/dateUtils');

// GET /api/cold-lists - Listar todas as listas de clientes frios
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = { owner: req.user.id };
    if (projectId) {
      query.project = projectId;
    }

    const coldLists = await ColdList.find(query)
      .populate('project', 'name color icon')
      .populate('selectedVendors', 'name email phone')
      .populate('assignedUser', 'name email')
      .sort({ createdAt: -1 });

    res.json(coldLists);
  } catch (error) {
    console.error('Erro ao buscar listas de clientes frios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cold-lists/vendor-contacts-stats - Estatísticas de contatos por vendedor
router.get('/vendor-contacts-stats', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? parseDateFromFrontend(date) : new Date();

    // Buscar todas as listas onde o usuário é vendedor ou proprietário
    const coldLists = await ColdList.find({
      $or: [
        { owner: req.user.id },
        { 'selectedVendors': { $in: await Vendor.find({ user: req.user.id }).distinct('_id') } }
      ],
      status: { $in: ['in_progress', 'completed'] }
    })
    .populate('selectedVendors', 'name email phone user')
    .populate('project', 'name')
    .select('name status project selectedVendors importedClients startDate endDate');

    // Processar estatísticas por vendedor
    const vendorStats = new Map();

    coldLists.forEach(list => {
      list.selectedVendors.forEach(vendor => {
        if (!vendorStats.has(vendor._id.toString())) {
          vendorStats.set(vendor._id.toString(), {
            vendorId: vendor._id,
            vendorName: vendor.name,
            vendorEmail: vendor.email,
            totalLists: 0,
            totalClients: 0,
            contactedClients: 0,
            lists: []
          });
        }

        const stats = vendorStats.get(vendor._id.toString());
        
        // Filtrar clientes atribuídos a este vendedor
        const vendorClients = list.importedClients.filter(client => 
          client.assignedVendor && client.assignedVendor.toString() === vendor._id.toString()
        );

        const contactedCount = vendorClients.filter(client => client.contacted).length;
        
        stats.totalLists += 1;
        stats.totalClients += vendorClients.length;
        stats.contactedClients += contactedCount;
        
        stats.lists.push({
          listId: list._id,
          listName: list.name,
          projectName: list.project?.name || 'Sem projeto',
          status: list.status,
          clients: vendorClients.length,
          contacted: contactedCount,
          contactPercentage: vendorClients.length > 0 ? Math.round((contactedCount / vendorClients.length) * 100) : 0
        });
      });
    });

    // Converter Map para Array e calcular percentuais
    const result = Array.from(vendorStats.values()).map(stats => ({
      ...stats,
      contactPercentage: stats.totalClients > 0 ? Math.round((stats.contactedClients / stats.totalClients) * 100) : 0
    }));

    // Ordenar por total de clientes (decrescente)
    result.sort((a, b) => b.totalClients - a.totalClients);

    res.json({
      date: targetDate,
      vendorStats: result,
      summary: {
        totalVendors: result.length,
        totalClients: result.reduce((sum, vendor) => sum + vendor.totalClients, 0),
        totalContacted: result.reduce((sum, vendor) => sum + vendor.contactedClients, 0),
        overallPercentage: result.length > 0 ? 
          Math.round((result.reduce((sum, vendor) => sum + vendor.contactedClients, 0) / 
                     result.reduce((sum, vendor) => sum + vendor.totalClients, 0)) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de vendedores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cold-lists/:id - Buscar lista específica
router.get('/:id', auth, async (req, res) => {
  try {
    const coldList = await ColdList.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('project', 'name color icon')
      .populate('selectedVendors', 'name email phone');

    if (!coldList) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    res.json(coldList);
  } catch (error) {
    console.error('Erro ao buscar lista:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cold-lists - Criar nova lista de clientes frios
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Nome da lista é obrigatório'),
  body('clientsPerDay').isInt({ min: 1 }).withMessage('Clientes por dia deve ser um número positivo'),
  body('clientsPerVendor').isInt({ min: 1 }).withMessage('Clientes por vendedor deve ser um número positivo'),
  body('selectedVendors').isArray({ min: 1 }).withMessage('Selecione pelo menos um vendedor'),
  body('startDate').isISO8601().withMessage('Data de início inválida'),
  body('endDate').isISO8601().withMessage('Data de fim inválida'),
  body('projectId').notEmpty().withMessage('ID do projeto é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      clientsPerDay,
      clientsPerVendor,
      selectedVendors,
      startDate,
      endDate,
      projectId,
      assignedUserId
    } = req.body;

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

    // Verificar se os vendedores existem e pertencem ao usuário
    const vendors = await Vendor.find({
      _id: { $in: selectedVendors },
      owner: req.user.id,
      active: true
    });

    if (vendors.length !== selectedVendors.length) {
      return res.status(400).json({ message: 'Um ou mais vendedores não foram encontrados' });
    }

    // Calcular total de clientes
    const totalClients = clientsPerDay * selectedVendors.length * Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );

    const coldList = new ColdList({
      name,
      description: description || '',
      clientsPerDay,
      clientsPerVendor,
      selectedVendors,
      totalClients,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      owner: req.user.id,
      project: projectId,
      assignedUser: assignedUserId || req.user.id
    });

    await coldList.save();
    await coldList.populate('project selectedVendors assignedUser', 'name color icon email phone');

    res.status(201).json(coldList);
  } catch (error) {
    console.error('Erro ao criar lista de clientes frios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cold-lists/:id/upload - Upload de planilha de clientes frios
router.post('/:id/upload', auth, excelUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo é obrigatório' });
    }

    const coldList = await ColdList.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!coldList) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    // Mapeamento padrão para clientes frios (apenas nome e telefone)
    const defaultMapping = {
      name: 'Nome',
      phone: 'Telefone'
    };

    const result = await processFile(req.file.path, defaultMapping, []);

    // Limpar arquivo temporário
    cleanupFile(req.file.path);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Filtrar apenas clientes válidos (com nome e telefone)
    const validClients = result.data.filter(clientData => 
      clientData.name && clientData.name.trim() && 
      clientData.phone && clientData.phone.trim()
    );

    // Salvar clientes na lista
    coldList.importedClients = validClients.map(client => ({
      name: client.name.trim(),
      phone: client.phone.trim()
    }));
    coldList.totalClients = validClients.length;
    await coldList.save();

    res.json({
      message: `${validClients.length} clientes válidos importados com sucesso`,
      totalClients: validClients.length,
      clients: validClients.slice(0, 10) // Mostrar apenas os primeiros 10 para preview
    });
  } catch (error) {
    console.error('Erro ao processar planilha:', error);
    if (req.file) {
      cleanupFile(req.file.path);
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cold-lists/:id/preview - Preview da planilha antes de importar
router.post('/:id/preview', auth, excelUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo é obrigatório' });
    }

    const coldList = await ColdList.findOne({ _id: req.params.id, owner: req.user.id });
    if (!coldList) {
      cleanupFile(req.file.path);
      return res.status(404).json({ message: 'Lista de clientes frios não encontrada' });
    }

    const result = await processFile(req.file.path, { name: 'Nome', phone: 'Telefone' }, []);

    cleanupFile(req.file.path);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Retornar preview dos dados e colunas disponíveis
    res.json({
      success: true,
      totalRows: result.totalRows,
      columns: result.columns || [],
      preview: result.data.slice(0, 10), // Primeiros 10 registros para preview
      errors: result.errors || []
    });
  } catch (error) {
    console.error('Erro ao fazer preview da planilha:', error);
    if (req.file) {
      cleanupFile(req.file.path);
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cold-lists/:id/import - Importar com mapeamento de colunas
router.post('/:id/import', auth, excelUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo é obrigatório' });
    }

    const { columnMapping } = req.body;
    const parsedColumnMapping = JSON.parse(columnMapping);

    const coldList = await ColdList.findOne({ _id: req.params.id, owner: req.user.id });
    if (!coldList) {
      cleanupFile(req.file.path);
      return res.status(404).json({ message: 'Lista de clientes frios não encontrada' });
    }

    // Processar arquivo com mapeamento personalizado
    const result = await processFile(req.file.path, parsedColumnMapping, []);
    cleanupFile(req.file.path);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Filtrar apenas clientes válidos (com nome e telefone)
    const validClients = result.data.filter((clientData) =>
      clientData.name && clientData.name.trim() &&
      clientData.phone && clientData.phone.trim()
    );

    // Salvar clientes na lista
    coldList.importedClients = validClients.map((client) => ({
      name: client.name.trim(),
      phone: client.phone.trim()
    }));
    coldList.totalClients = validClients.length;
    await coldList.save();

    res.json({
      message: `${validClients.length} clientes válidos importados com sucesso`,
      totalClients: validClients.length,
      clients: validClients.slice(0, 10)
    });
  } catch (error) {
    console.error('Erro ao importar clientes:', error);
    if (req.file) {
      cleanupFile(req.file.path);
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cold-lists/:id/generate-tasks - Gerar tarefas para vendedores
router.post('/:id/generate-tasks', auth, async (req, res) => {
  try {
    const coldList = await ColdList.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('selectedVendors project');

    if (!coldList) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    if (coldList.status === 'completed') {
      return res.status(400).json({ message: 'Tarefas já foram geradas para esta lista' });
    }

    // Atualizar status para processando
    coldList.status = 'processing';
    await coldList.save();

    // Distribuir clientes entre vendedores por data
    const clients = coldList.importedClients || [];
    const vendors = coldList.selectedVendors;
    const startDate = new Date(coldList.startDate);
    const endDate = new Date(coldList.endDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Distribuir clientes de forma mais equilibrada
    // Calcular quantos clientes cada vendedor deve ter por dia baseado nos parâmetros da lista
    const clientsPerVendorPerDay = Math.ceil(coldList.clientsPerVendor / daysDiff);
    let clientIndex = 0;
    
    console.log('=== DISTRIBUIÇÃO DE CLIENTES ===');
    console.log('Total de clientes:', clients.length);
    console.log('Vendedores:', vendors.length);
    console.log('Dias:', daysDiff);
    console.log('Clientes por vendedor por dia (calculado):', clientsPerVendorPerDay);
    
    // Atualizar clientes com vendedor e data atribuída
    for (let day = 0; day < daysDiff && clientIndex < clients.length; day++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + day);
      
      for (const vendor of vendors) {
        // Usar o número calculado ou o que sobrou
        const remainingClients = clients.length - clientIndex;
        const clientsToAssign = Math.min(clientsPerVendorPerDay, remainingClients);
        
        if (clientsToAssign > 0) {
          const dayClients = clients.slice(clientIndex, clientIndex + clientsToAssign);
          
          console.log(`Dia ${day + 1}, Vendedor ${vendor.name}: ${dayClients.length} clientes`);
          
          // Atualizar clientes com vendedor e data
          dayClients.forEach((client, index) => {
            const globalIndex = clients.findIndex(c => c.name === client.name && c.phone === client.phone);
            if (globalIndex !== -1) {
              coldList.importedClients[globalIndex].assignedVendor = vendor._id;
              coldList.importedClients[globalIndex].assignedDate = taskDate;
            }
          });
          
          clientIndex += clientsToAssign;
        }
        
        if (clientIndex >= clients.length) break;
      }
      
      if (clientIndex >= clients.length) break;
    }
    
    console.log('Total de clientes atribuídos:', clientIndex);
    console.log('===============================');

    // Salvar as alterações nos clientes
    await coldList.save();

    // Gerar tarefas para cada vendedor por dia
    const tasks = [];
    clientIndex = 0;
    
    for (let day = 0; day < daysDiff && clientIndex < clients.length; day++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + day);
      
      for (const vendor of vendors) {
        const remainingClients = clients.length - clientIndex;
        const clientsToAssign = Math.min(clientsPerVendorPerDay, remainingClients);
        
        if (clientsToAssign > 0) {
          const dayClients = clients.slice(clientIndex, clientIndex + clientsToAssign);
          
          const task = new Task({
            title: `${coldList.name} - ${vendor.name} - ${taskDate.toLocaleDateString('pt-BR')}`,
            description: `${dayClients.length} clientes para contatar`,
            status: 'todo',
            priority: 'medium',
            dueDate: taskDate,
            assignedTo: [vendor._id],
            project: coldList.project._id,
            createdBy: req.user.id,
            isRecurring: false
          });

          tasks.push(task);
          clientIndex += clientsToAssign;
        }
        
        if (clientIndex >= clients.length) break;
      }
      
      if (clientIndex >= clients.length) break;
    }

    // Inserir todas as tarefas
    if (tasks.length > 0) {
      await Task.insertMany(tasks);
      coldList.tasksGenerated = tasks.length;
      coldList.status = 'completed';
      await coldList.save();
    }

    res.json({
      message: `${tasks.length} tarefas geradas com sucesso`,
      tasksGenerated: tasks.length,
      vendors: coldList.selectedVendors.length,
      days: daysDiff
    });
  } catch (error) {
    console.error('Erro ao gerar tarefas:', error);
    
    // Reverter status em caso de erro
    try {
      await ColdList.findByIdAndUpdate(req.params.id, { status: 'pending' });
    } catch (updateError) {
      console.error('Erro ao reverter status:', updateError);
    }
    
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cold-lists/:id/daily-contacts - Buscar clientes do dia para contato
router.get('/:id/daily-contacts', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? parseDateFromFrontend(date) : new Date();

    const coldList = await ColdList.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { assignedUser: req.user.id }
      ]
    }).populate('selectedVendors', 'name email phone user');

    if (!coldList) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    // Verificar se o usuário é um dos vendedores selecionados
    const userVendor = coldList.selectedVendors.find(vendor => 
      vendor.user && vendor.user.toString() === req.user.id
    );

    if (!userVendor && coldList.assignedUser?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar esta lista' });
    }

    // Filtrar clientes do dia para o vendedor específico
    const dailyClients = coldList.importedClients.filter(client => {
      if (userVendor && client.assignedVendor?.toString() !== userVendor._id.toString()) {
        return false;
      }
      
      if (client.assignedDate) {
        const clientDate = new Date(client.assignedDate);
        clientDate.setHours(0, 0, 0, 0);
        return clientDate.getTime() === targetDate.getTime();
      }
      
      return false;
    });

    // Calcular estatísticas
    const totalClients = dailyClients.length;
    const contactedClients = dailyClients.filter(client => client.contacted).length;
    const contactPercentage = totalClients > 0 ? Math.round((contactedClients / totalClients) * 100) : 0;

    // Estatísticas por vendedor (se for o dono da lista)
    let vendorStats = [];
    if (coldList.owner.toString() === req.user.id) {
      for (const vendor of coldList.selectedVendors) {
        const vendorClients = coldList.importedClients.filter(client => 
          client.assignedVendor?.toString() === vendor._id.toString() &&
          client.assignedDate &&
          new Date(client.assignedDate).setHours(0, 0, 0, 0) === targetDate.getTime()
        );
        
        const vendorContacted = vendorClients.filter(client => client.contacted).length;
        const vendorPercentage = vendorClients.length > 0 ? Math.round((vendorContacted / vendorClients.length) * 100) : 0;
        
        vendorStats.push({
          vendorId: vendor._id,
          vendorName: vendor.name,
          totalClients: vendorClients.length,
          contactedClients: vendorContacted,
          contactPercentage: vendorPercentage
        });
      }
    }

    res.json({
      coldList: {
        _id: coldList._id,
        name: coldList.name,
        description: coldList.description
      },
      date: targetDate,
      clients: dailyClients,
      stats: {
        totalClients,
        contactedClients,
        contactPercentage,
        vendorStats
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes do dia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/cold-lists/:id/contact-client - Marcar cliente como contatado
router.put('/:id/contact-client', auth, async (req, res) => {
  try {
    const { clientIndex, contacted } = req.body;

    const coldList = await ColdList.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { assignedUser: req.user.id }
      ]
    }).populate('selectedVendors', 'user');

    if (!coldList) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    // Verificar se o usuário tem permissão
    const userVendor = coldList.selectedVendors.find(vendor => 
      vendor.user && vendor.user.toString() === req.user.id
    );

    if (!userVendor && coldList.assignedUser?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Você não tem permissão para modificar esta lista' });
    }

    if (clientIndex < 0 || clientIndex >= coldList.importedClients.length) {
      return res.status(400).json({ message: 'Índice de cliente inválido' });
    }

    const client = coldList.importedClients[clientIndex];
    
    // Verificar se o cliente pertence ao vendedor (se aplicável)
    if (userVendor && client.assignedVendor?.toString() !== userVendor._id.toString()) {
      return res.status(403).json({ message: 'Você não tem permissão para modificar este cliente' });
    }

    // Atualizar status de contato
    coldList.importedClients[clientIndex].contacted = contacted;
    coldList.importedClients[clientIndex].contactDate = contacted ? new Date() : null;
    coldList.importedClients[clientIndex].contactedBy = contacted ? req.user.id : null;

    await coldList.save();

    res.json({
      message: contacted ? 'Cliente marcado como contatado' : 'Cliente desmarcado como contatado',
      client: coldList.importedClients[clientIndex]
    });
  } catch (error) {
    console.error('Erro ao atualizar status de contato:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cold-lists/assigned/daily-summary - Resumo diário das listas atribuídas
router.get('/assigned/daily-summary', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? parseDateFromFrontend(date) : new Date();

    console.log('=== DEBUG DAILY SUMMARY ===');
    console.log('User ID:', req.user.id);
    console.log('Target Date:', targetDate);

    // Buscar listas atribuídas ao usuário
    const assignedLists = await ColdList.find({
      assignedUser: req.user.id,
      status: { $in: ['pending', 'processing', 'completed'] }
    }).populate('selectedVendors', 'name user');

    console.log('Assigned Lists Found:', assignedLists.length);
    assignedLists.forEach(list => {
      console.log(`List: ${list.name}, Status: ${list.status}`);
      console.log('Selected Vendors:', list.selectedVendors.map(v => ({ name: v.name, user: v.user })));
    });

    const summary = [];

    for (const coldList of assignedLists) {
      // Verificar se o usuário é um dos vendedores
      const userVendor = coldList.selectedVendors.find(vendor => 
        vendor.user && vendor.user.toString() === req.user.id
      );

      console.log(`Checking list ${coldList.name}:`);
      console.log('User Vendor Found:', userVendor ? userVendor.name : 'None');

      if (userVendor) {
        // Filtrar clientes do dia para este vendedor
        const dailyClients = coldList.importedClients.filter(client => {
          if (client.assignedVendor?.toString() !== userVendor._id.toString()) {
            return false;
          }
          
          if (client.assignedDate) {
            const clientDate = new Date(client.assignedDate);
            clientDate.setHours(0, 0, 0, 0);
            return clientDate.getTime() === targetDate.getTime();
          }
          
          return false;
        });

        console.log(`Daily clients for ${userVendor.name}:`, dailyClients.length);

        const totalClients = dailyClients.length;
        const contactedClients = dailyClients.filter(client => client.contacted).length;
        const contactPercentage = totalClients > 0 ? Math.round((contactedClients / totalClients) * 100) : 0;

        if (totalClients > 0) {
          summary.push({
            coldListId: coldList._id,
            coldListName: coldList.name,
            vendorName: userVendor.name,
            totalClients,
            contactedClients,
            contactPercentage,
            clients: dailyClients
          });
        }
      }
    }

    // Calcular estatísticas gerais
    const totalClientsAll = summary.reduce((sum, item) => sum + item.totalClients, 0);
    const totalContactedAll = summary.reduce((sum, item) => sum + item.contactedClients, 0);
    const overallPercentage = totalClientsAll > 0 ? Math.round((totalContactedAll / totalClientsAll) * 100) : 0;

    console.log('Final Summary:', summary.length, 'items');
    console.log('========================');

    res.json({
      date: targetDate,
      summary,
      overallStats: {
        totalClients: totalClientsAll,
        contactedClients: totalContactedAll,
        contactPercentage: overallPercentage
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo diário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cold-lists/:id/redistribute - Redistribuir clientes de uma lista
router.post('/:id/redistribute', auth, async (req, res) => {
  try {
    const coldList = await ColdList.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('selectedVendors project');

    if (!coldList) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    if (coldList.importedClients.length === 0) {
      return res.status(400).json({ message: 'Lista não possui clientes importados' });
    }

    // Limpar atribuições anteriores
    coldList.importedClients.forEach(client => {
      client.assignedVendor = null;
      client.assignedDate = null;
      client.contacted = false;
      client.contactDate = null;
      client.contactedBy = null;
    });

    // Redistribuir clientes
    const clients = coldList.importedClients;
    const vendors = coldList.selectedVendors;
    const startDate = new Date(coldList.startDate);
    const endDate = new Date(coldList.endDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const clientsPerVendorPerDay = Math.ceil(coldList.clientsPerVendor / daysDiff);
    let clientIndex = 0;
    
    console.log('=== REDISTRIBUIÇÃO DE CLIENTES ===');
    console.log('Total de clientes:', clients.length);
    console.log('Vendedores:', vendors.length);
    console.log('Dias:', daysDiff);
    console.log('Clientes por vendedor por dia:', clientsPerVendorPerDay);
    
    for (let day = 0; day < daysDiff && clientIndex < clients.length; day++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + day);
      
      for (const vendor of vendors) {
        const remainingClients = clients.length - clientIndex;
        const clientsToAssign = Math.min(clientsPerVendorPerDay, remainingClients);
        
        if (clientsToAssign > 0) {
          const dayClients = clients.slice(clientIndex, clientIndex + clientsToAssign);
          
          console.log(`Dia ${day + 1}, Vendedor ${vendor.name}: ${dayClients.length} clientes`);
          
          dayClients.forEach((client, index) => {
            const globalIndex = clients.findIndex(c => c.name === client.name && c.phone === client.phone);
            if (globalIndex !== -1) {
              coldList.importedClients[globalIndex].assignedVendor = vendor._id;
              coldList.importedClients[globalIndex].assignedDate = taskDate;
            }
          });
          
          clientIndex += clientsToAssign;
        }
        
        if (clientIndex >= clients.length) break;
      }
      
      if (clientIndex >= clients.length) break;
    }
    
    await coldList.save();
    
    console.log('Total de clientes redistribuídos:', clientIndex);
    console.log('==================================');

    res.json({
      message: `${clientIndex} clientes redistribuídos com sucesso`,
      totalClients: clientIndex,
      vendors: vendors.length,
      days: daysDiff
    });
  } catch (error) {
    console.error('Erro ao redistribuir clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cold-lists/debug/user-vendor - Debug para verificar se usuário é vendedor
router.get('/debug/user-vendor', auth, async (req, res) => {
  try {
    const Vendor = require('../models/Vendor');
    
    // Buscar vendedores onde o usuário está vinculado
    const userVendors = await Vendor.find({
      user: req.user.id
    });

    // Buscar listas atribuídas ao usuário
    const assignedLists = await ColdList.find({
      assignedUser: req.user.id
    }).populate('selectedVendors', 'name user');

    res.json({
      userId: req.user.id,
      userVendors: userVendors.map(v => ({
        id: v._id,
        name: v.name,
        email: v.email,
        user: v.user
      })),
      assignedLists: assignedLists.map(list => ({
        id: list._id,
        name: list.name,
        status: list.status,
        selectedVendors: list.selectedVendors.map(v => ({
          id: v._id,
          name: v.name,
          user: v.user
        }))
      }))
    });
  } catch (error) {
    console.error('Erro no debug:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/cold-lists/:id - Deletar lista
router.delete('/:id', auth, async (req, res) => {
  try {
    const coldList = await ColdList.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!coldList) {
      return res.status(404).json({ message: 'Lista não encontrada' });
    }

    res.json({ message: 'Lista deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lista:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
