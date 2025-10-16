const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔨 Iniciando build do Trello Nippon...\n');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function execCommand(command, cwd) {
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true
    });
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar comando:', command);
    return false;
  }
}

// 1. Instalar dependências do Backend
log('\n📦 1/4 Instalando dependências do Backend...', 'blue');
if (!execCommand('npm install', path.join(__dirname, 'backend'))) {
  process.exit(1);
}

// 2. Instalar dependências do Frontend
log('\n📦 2/4 Instalando dependências do Frontend...', 'blue');
if (!execCommand('npm install', path.join(__dirname, 'frontend'))) {
  process.exit(1);
}

// 3. Fazer build do Frontend
log('\n🏗️  3/4 Fazendo build do Frontend (Next.js)...', 'blue');
if (!execCommand('npm run build', path.join(__dirname, 'frontend'))) {
  process.exit(1);
}

// 4. Verificar se o build foi criado
log('\n✅ 4/4 Verificando build...', 'blue');
const outPath = path.join(__dirname, 'frontend', 'out');
if (fs.existsSync(outPath)) {
  const files = fs.readdirSync(outPath);
  log(`✅ Build criado com sucesso! (${files.length} arquivos)`, 'green');
} else {
  log('❌ Pasta "out" não foi criada!', 'yellow');
  process.exit(1);
}

// Sucesso!
log('\n' + '='.repeat(50), 'green');
log('🎉 BUILD COMPLETO!', 'bright');
log('='.repeat(50), 'green');
log('\n📋 Próximos passos:', 'blue');
log('   1. Configure backend/.env para produção');
log('   2. Execute: cd backend && npm start');
log('   3. Acesse: http://localhost:5000\n');
log('💡 Ou use: npm start (da raiz do projeto)\n', 'yellow');

