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
const clientRoutes = require('./routes/clients');
const vendorRoutes = require('./routes/vendors');
const analyticsRoutes = require('./routes/analytics');
const coldListRoutes = require('./routes/coldLists');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://trello-nippon.onrender.com',
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cold-lists', coldListRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Trello Nippon API está funcionando!' });
});

// Servir frontend em produção
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/out');
  
  // Servir arquivos estáticos do Next.js
  app.use(express.static(frontendPath));
  
  // Redirecionar todas as outras rotas para o index.html (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

