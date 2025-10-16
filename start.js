#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

console.log('\n' + '='.repeat(60));
log('       🎯 TRELLO NIPPON - INICIANDO SERVIDOR', 'bright');
console.log('='.repeat(60) + '\n');

// Verificar se as dependências estão instaladas
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
const frontendOutDir = path.join(__dirname, 'frontend', 'out');

if (!fs.existsSync(backendNodeModules)) {
  log('📦 Instalando dependências do backend...', 'blue');
  try {
    execSync('npm install', { 
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit'
    });
    log('✅ Dependências instaladas!\n', 'green');
  } catch (error) {
    log('❌ Erro ao instalar dependências', 'red');
    process.exit(1);
  }
}

if (!fs.existsSync(frontendOutDir)) {
  log('⚠️  Build do frontend não encontrado.', 'yellow');
  log('   Execute "npm run build:frontend" primeiro.', 'yellow');
  log('   Ou o servidor rodará apenas a API.\n', 'yellow');
}

// Verificar arquivo .env
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  log('⚠️  Arquivo .env não encontrado!', 'yellow');
  log('   Crie backend/.env com suas configurações.', 'yellow');
  log('   Veja backend/.env.example para referência.\n', 'yellow');
}

// Iniciar servidor
log('🚀 Iniciando Trello Nippon...\n', 'blue');

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('error', (error) => {
  log('❌ Erro ao iniciar servidor:', 'red');
  console.error(error);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    log(`\n❌ Servidor encerrado com código ${code}`, 'red');
  }
  process.exit(code);
});

// Tratamento de sinais para encerramento gracioso
process.on('SIGINT', () => {
  log('\n\n👋 Encerrando servidor...', 'yellow');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});

