# 🚀 Setup Completo no Render

## ✅ Passo a Passo Final

### 1. Fazer Build Local

```powershell
cd frontend
npm run build
cd ..
```

### 2. Commitar e Enviar para GitHub

```powershell
git add .
git commit -m "Update for Render production"
git push
```

### 3. Configurar Variáveis no Render

No painel do Render (https://dashboard.render.com):

1. Vá no seu Web Service **"trello-nippon"**
2. Clique em **"Environment"** no menu lateral
3. Adicione estas variáveis:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello` |
| `JWT_SECRET` | `trello_render_prod_2024_mude_isto` |
| `FRONTEND_URL` | `https://trello-nippon.onrender.com` |

4. Clique em **"Save Changes"**

### 4. Fazer Deploy

1. Vá em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**
3. Aguarde o deploy terminar (pode demorar 2-3 minutos)

### 5. Acessar

**URL**: https://trello-nippon.onrender.com/

✅ Crie sua conta
✅ Comece a usar!

---

## 🎯 Pronto!

O Trello Nippon está rodando em produção no Render! 🎉

