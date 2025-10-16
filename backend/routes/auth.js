const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendVerificationEmail, resendVerificationEmail } = require('../config/email');

// Registro de usuário
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    console.log('🔐 Gerando token de verificação...');
    console.log('📧 Email:', email);
    console.log('🎟️ Token:', verificationToken);
    console.log('⏰ Expira em:', verificationTokenExpires);

    // Criar novo usuário
    const user = new User({ 
      name, 
      email, 
      password,
      verificationToken,
      verificationTokenExpires,
      emailVerified: false
    });
    await user.save();

    console.log('✅ Usuário criado no banco de dados');

    // Enviar email de verificação
    try {
      const emailResult = await sendVerificationEmail(user, verificationToken);
      console.log('📧 Resultado do envio de email:', emailResult);
    } catch (error) {
      console.error('❌ Erro ao enviar email de verificação:', error);
      // Continua mesmo se o email falhar
    }

    // Gerar token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      },
      message: 'Conta criada! Verifique seu email para ativar sua conta.'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Obter usuário atual
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      emailVerified: req.user.emailVerified
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ message: 'Erro ao obter dados do usuário' });
  }
});

// Listar todos os usuários (para atribuições)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Buscar usuário por email (para compartilhamento de projetos)
router.get('/users/by-email/:email', auth, async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    
    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado com este email',
        found: false 
      });
    }

    res.json({
      found: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

// Verificar email
router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token;

    console.log('🔍 Tentando verificar email com token:', token);

    if (!token) {
      console.log('❌ Token não fornecido');
      return res.status(400).json({ 
        message: 'Token de verificação não fornecido',
        success: false
      });
    }

    // Buscar usuário com este token (sem verificar expiração primeiro para debug)
    const userWithToken = await User.findOne({ verificationToken: token });
    
    if (!userWithToken) {
      console.log('❌ Nenhum usuário encontrado com este token');
      return res.status(400).json({ 
        message: 'Token de verificação inválido',
        success: false
      });
    }

    console.log('✅ Usuário encontrado:', userWithToken.email);
    console.log('📅 Token expira em:', userWithToken.verificationTokenExpires);
    console.log('⏰ Data atual:', new Date());
    console.log('🔍 Token expirado?', userWithToken.verificationTokenExpires < Date.now());

    // Verificar se o email já foi verificado
    if (userWithToken.emailVerified) {
      console.log('✅ Email já estava verificado');
      return res.json({ 
        message: 'Email já foi verificado anteriormente!',
        success: true
      });
    }

    // Verificar expiração
    if (userWithToken.verificationTokenExpires < Date.now()) {
      console.log('❌ Token expirado');
      return res.status(400).json({ 
        message: 'Token expirado. Solicite um novo email de verificação.',
        success: false,
        expired: true
      });
    }

    // Verificar email
    userWithToken.emailVerified = true;
    userWithToken.verificationToken = null;
    userWithToken.verificationTokenExpires = null;
    await userWithToken.save();

    console.log('✅ Email verificado com sucesso!');

    res.json({ 
      message: 'Email verificado com sucesso!',
      success: true
    });
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error);
    res.status(500).json({ message: 'Erro ao verificar email' });
  }
});

// Reenviar email de verificação
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email já verificado' });
    }

    // Gerar novo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Reenviar email
    const result = await resendVerificationEmail(user, verificationToken);

    if (result.success) {
      res.json({ message: 'Email de verificação reenviado com sucesso!' });
    } else {
      res.status(500).json({ message: 'Erro ao reenviar email' });
    }
  } catch (error) {
    console.error('Erro ao reenviar email:', error);
    res.status(500).json({ message: 'Erro ao reenviar email de verificação' });
  }
});

module.exports = router;

