const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const auth = require('../middleware/auth');

// GET /api/analytics/clients - Analytics de clientes
router.get('/clients', auth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      vendorId, 
      plan, 
      origin, 
      paymentMethod, 
      confirmed, 
      homeVisit,
      projectId 
    } = req.query;

    // Construir filtros
    let filters = { owner: req.user.id };
    
    if (projectId) {
      filters.project = projectId;
    }
    
    if (vendorId) {
      filters.vendor = vendorId;
    }
    
    if (plan) {
      filters.plan = plan;
    }
    
    if (origin) {
      filters.origin = origin;
    }
    
    if (paymentMethod) {
      filters.paymentMethod = paymentMethod;
    }
    
    if (confirmed !== undefined) {
      if (confirmed === 'true') {
        filters.confirmation = { $ne: '' };
      } else {
        filters.confirmation = '';
      }
    }
    
    if (homeVisit !== undefined) {
      filters.homeVisit = homeVisit === 'true';
    }
    
    if (startDate || endDate) {
      filters.adhesionDate = {};
      if (startDate) {
        filters.adhesionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.adhesionDate.$lte = new Date(endDate);
      }
    }

    // Buscar todos os clientes com filtros
    const clients = await Client.find(filters)
      .populate('vendor', 'name')
      .sort({ adhesionDate: -1 });

    // Calcular analytics
    const analytics = calculateAnalytics(clients);

    res.json(analytics);
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/analytics/monthly-lists - Listas mensais
router.get('/monthly-lists', auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let filters = { owner: req.user.id };
    if (projectId) {
      filters.project = projectId;
    }

    // Agrupar por mês/ano
    const monthlyData = await Client.aggregate([
      { $match: filters },
      {
        $group: {
          _id: {
            month: '$listMonth',
            year: '$listYear'
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$adhesionValue' },
          clients: { $push: '$$ROOT' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Buscar vendedores para popular
    const vendors = await Vendor.find({ owner: req.user.id, active: true });
    const vendorMap = vendors.reduce((acc, vendor) => {
      acc[vendor._id.toString()] = vendor.name;
      return acc;
    }, {});

    // Processar dados
    const processedData = monthlyData.map(item => ({
      month: item._id.month,
      year: item._id.year,
      count: item.count,
      totalValue: item.totalValue,
      clients: item.clients.map(client => ({
        ...client,
        vendorName: client.vendor ? vendorMap[client.vendor.toString()] : null
      }))
    }));

    res.json(processedData);
  } catch (error) {
    console.error('Erro ao buscar listas mensais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Função para calcular analytics
function calculateAnalytics(clients) {
  const totalClients = clients.length;
  const totalValue = clients.reduce((sum, client) => sum + (client.adhesionValue || 0), 0);
  const averageValue = totalClients > 0 ? totalValue / totalClients : 0;

  // Clientes por mês
  const monthlyClients = {};
  clients.forEach(client => {
    if (client.listMonth && client.listYear) {
      const key = `${client.listMonth}/${client.listYear}`;
      if (!monthlyClients[key]) {
        monthlyClients[key] = { month: client.listMonth, year: client.listYear, count: 0, totalValue: 0 };
      }
      monthlyClients[key].count++;
      monthlyClients[key].totalValue += client.adhesionValue || 0;
    }
  });

  // Clientes por plano
  const clientsByPlan = {};
  clients.forEach(client => {
    const plan = client.plan || 'Não informado';
    if (!clientsByPlan[plan]) {
      clientsByPlan[plan] = { plan, count: 0, totalValue: 0 };
    }
    clientsByPlan[plan].count++;
    clientsByPlan[plan].totalValue += client.adhesionValue || 0;
  });

  // Clientes por vendedor
  const clientsByVendor = {};
  clients.forEach(client => {
    const vendor = client.vendor ? client.vendor.name : 'Não informado';
    if (!clientsByVendor[vendor]) {
      clientsByVendor[vendor] = { vendor, count: 0, totalValue: 0 };
    }
    clientsByVendor[vendor].count++;
    clientsByVendor[vendor].totalValue += client.adhesionValue || 0;
  });

  // Clientes por origem
  const clientsByOrigin = {};
  clients.forEach(client => {
    const origin = client.origin || 'Não informado';
    if (!clientsByOrigin[origin]) {
      clientsByOrigin[origin] = { origin, count: 0 };
    }
    clientsByOrigin[origin].count++;
  });

  // Clientes por forma de pagamento
  const clientsByPaymentMethod = {};
  clients.forEach(client => {
    const method = client.paymentMethod || 'Não informado';
    if (!clientsByPaymentMethod[method]) {
      clientsByPaymentMethod[method] = { method, count: 0, totalValue: 0 };
    }
    clientsByPaymentMethod[method].count++;
    clientsByPaymentMethod[method].totalValue += client.adhesionValue || 0;
  });

  // Confirmados vs não confirmados
  const confirmed = clients.filter(client => client.confirmation && client.confirmation.trim() !== '').length;
  const unconfirmed = totalClients - confirmed;

  // Visitas à casa
  const withVisit = clients.filter(client => client.homeVisit).length;
  const withoutVisit = totalClients - withVisit;

  return {
    monthlyClients: Object.values(monthlyClients).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month.localeCompare(a.month);
    }),
    clientsByPlan: Object.values(clientsByPlan),
    clientsByVendor: Object.values(clientsByVendor),
    clientsByOrigin: Object.values(clientsByOrigin),
    clientsByPaymentMethod: Object.values(clientsByPaymentMethod),
    confirmedVsUnconfirmed: { confirmed, unconfirmed },
    homeVisits: { withVisit, withoutVisit },
    totalClients,
    totalValue,
    averageValue
  };
}

module.exports = router;
