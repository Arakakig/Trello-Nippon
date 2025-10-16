# 🔧 Solução Rápida - Erro Nodemailer

## ❌ Erro: "nodemailer.createTransporter is not a function"

### ✅ SOLUÇÃO (Windows)

Execute estes comandos **UM POR VEZ** no PowerShell/Terminal:

```powershell
# 1. Vá para a pasta do projeto
cd "C:\Users\guilh\OneDrive\Documentos\GitHub\Trello Nippon"

# 2. Vá para a pasta backend
cd backend

# 3. Instale o nodemailer
npm install nodemailer@6.9.7 --save

# 4. Verifique se foi instalado
npm list nodemailer

# 5. Reinicie o servidor
npm run dev
```

### Se o Erro Persistir

**Limpe e reinstale tudo:**

```powershell
# Na pasta backend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run dev
```

### Teste Rápido

Crie um arquivo `test.js` na pasta backend:

```javascript
const nodemailer = require('nodemailer');
console.log('Nodemailer OK:', typeof nodemailer.createTransporter === 'function' ? '✅' : '❌');
```

Execute:
```powershell
node test.js
```

Se mostrar `✅`, está funcionando! Delete o arquivo `test.js` depois.

### Verificar Node.js

```powershell
node --version
npm --version
```

Você precisa de:
- Node.js **v18** ou superior
- NPM **v9** ou superior

### Estrutura de Pastas

Certifique-se de estar na pasta certa:

```
Trello Nippon/
└── backend/
    ├── config/
    │   └── email.js  ← Arquivo com nodemailer
    ├── node_modules/ ← Deve ter pasta nodemailer aqui
    ├── package.json
    └── server.js
```

## ✅ Checklist

- [ ] Está na pasta `backend`
- [ ] Executou `npm install nodemailer@6.9.7 --save`
- [ ] Aparece "added 1 package" ou similar
- [ ] `npm list nodemailer` mostra versão 6.9.7
- [ ] Reiniciou o servidor (`npm run dev`)

## 📞 Se Ainda Não Funcionar

1. **Versão do Node.js antiga?**
   - Baixe a versão LTS: https://nodejs.org/

2. **Pasta errada?**
   - Certifique-se de estar em: `Trello Nippon\backend`

3. **Permissões?**
   - Execute o PowerShell como **Administrador**

4. **Cache corrompido?**
   ```powershell
   npm cache clean --force
   npm install
   ```

---

**Após resolver, o servidor deve iniciar normalmente! 🎉**

