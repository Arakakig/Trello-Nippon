# 📦 Instalação de Dependências - Backend

## Erro: "nodemailer.createTransporter is not a function"

Se você está recebendo este erro, siga estes passos:

### Solução Rápida

```bash
# 1. Vá para a pasta backend
cd backend

# 2. Remova node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Windows (PowerShell):
Remove-Item -Recurse -Force node_modules, package-lock.json

# 3. Reinstale todas as dependências
npm install

# 4. Reinicie o servidor
npm run dev
```

### Solução Alternativa (Se o erro persistir)

```bash
cd backend

# Instalar nodemailer especificamente
npm install nodemailer@6.9.7 --save

# Reiniciar
npm run dev
```

### Verificar Instalação

Para verificar se o nodemailer foi instalado corretamente:

```bash
cd backend
npm list nodemailer
```

Você deve ver algo como:
```
trello-nippon-backend@1.0.0
└── nodemailer@6.9.7
```

### Dependências Necessárias

Certifique-se de que todas estas dependências estão instaladas:

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "multer": "^1.4.5-lts.1",
  "express-validator": "^7.0.1",
  "nodemailer": "^6.9.7"
}
```

### Teste Rápido

Crie um arquivo `test-nodemailer.js` no backend:

```javascript
const nodemailer = require('nodemailer');

console.log('Nodemailer type:', typeof nodemailer);
console.log('createTransporter type:', typeof nodemailer.createTransporter);

if (typeof nodemailer.createTransporter === 'function') {
  console.log('✅ Nodemailer instalado corretamente!');
} else {
  console.log('❌ Nodemailer não está funcionando!');
}
```

Execute:
```bash
node test-nodemailer.js
```

Deve mostrar:
```
✅ Nodemailer instalado corretamente!
```

## Outros Problemas Comuns

### Node.js Versão Incompatível

Certifique-se de estar usando Node.js 18 ou superior:

```bash
node --version
```

Se for menor que v18, atualize o Node.js.

### Cache do NPM

Limpe o cache do npm:

```bash
npm cache clean --force
npm install
```

### Permissões no Windows

Se estiver no Windows e tiver problemas de permissão:

1. Execute o terminal como Administrador
2. Ou use o PowerShell normal e tente novamente

## Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Na pasta `backend`
- [ ] Arquivo `package.json` existe
- [ ] Executou `npm install`
- [ ] Pasta `node_modules` foi criada
- [ ] Nodemailer aparece em `node_modules`
- [ ] Servidor inicia sem erros

## Se Ainda Não Funcionar

1. **Delete tudo e comece de novo**:
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verifique o arquivo email.js**:
   - Linha 1 deve ser: `const nodemailer = require('nodemailer');`
   - Sem espaços extras ou caracteres estranhos

3. **Verifique se está na pasta certa**:
   ```bash
   pwd  # Linux/Mac
   cd   # Windows
   ```
   
   Deve mostrar: `.../backend`

4. **Reinstale o Node.js** se necessário

## Suporte

Se o problema persistir, verifique:
- Versão do Node.js: `node --version`
- Versão do NPM: `npm --version`
- Sistema operacional
- Logs de erro completos

---

**Após resolver, delete o arquivo `test-nodemailer.js` se você o criou.**

