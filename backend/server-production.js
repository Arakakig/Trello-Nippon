require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Importar rotas
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const projectRoutes = require('./routes/projects');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Trello Nippon API está funcionando!',
    environment: process.env.NODE_ENV
  });
});

// ========================================
// SERVIR FRONTEND EM PRODUÇÃO
// ========================================

// Caminho para o build do frontend
const frontendBuildPath = path.join(__dirname, '../frontend/out');

// Servir arquivos estáticos do Next.js (_next, imagens, etc)
app.use(express.static(frontendBuildPath));

// Rotas do frontend Next.js
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'dashboard.html'));
});

app.get('/verify-email', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'verify-email.html'));
});

// Fallback: qualquer outra rota que não seja /api retorna o index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  }
});

// ========================================
// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ✅ Servidor Trello Nippon rodando!
  🌐 URL: http://localhost:${PORT}
  📊 API: http://localhost:${PORT}/api
  🏠 Frontend: ${process.env.NODE_ENV === 'production' ? 'Servido pelo Express' : 'Rodando separado'}
  `);
});

