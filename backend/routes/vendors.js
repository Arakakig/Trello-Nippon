const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/vendors - Buscar todos os vendedores do usuário
router.get('/', auth, async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = { owner: req.user.id };
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const vendors = await Vendor.find(query).sort({ name: 1 });

    res.json(vendors);
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/vendors/:id - Buscar vendedor específico
router.get('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendedor não encontrado' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Erro ao buscar vendedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/vendors - Criar novo vendedor
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Verificar se existe um usuário com o mesmo email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    const vendor = new Vendor({
      name,
      email,
      phone,
      owner: req.user.id,
      user: existingUser ? existingUser._id : null
    });

    await vendor.save();

    res.status(201).json(vendor);
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/vendors/:id - Atualizar vendedor
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, active } = req.body;

    // Verificar se existe um usuário com o mesmo email
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      {
        name,
        email,
        phone,
        active: active !== undefined ? active : true,
        user: existingUser ? existingUser._id : null
      },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendedor não encontrado' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/vendors/link-users - Vincular vendedores existentes aos usuários
router.post('/link-users', auth, async (req, res) => {
  try {
    const vendors = await Vendor.find({ owner: req.user.id });
    let linkedCount = 0;

    for (const vendor of vendors) {
      if (!vendor.user) {
        const existingUser = await User.findOne({ email: vendor.email.toLowerCase() });
        if (existingUser) {
          vendor.user = existingUser._id;
          await vendor.save();
          linkedCount++;
        }
      }
    }

    res.json({
      message: `${linkedCount} vendedores vinculados aos usuários`,
      linkedCount,
      totalVendors: vendors.length
    });
  } catch (error) {
    console.error('Erro ao vincular vendedores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/vendors/:id - Deletar vendedor
router.delete('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendedor não encontrado' });
    }

    res.json({ message: 'Vendedor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vendedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
