# ⚙️ Configuração do Render - Trello Nippon

## 🌐 Seu Deploy no Render

**URL**: https://trello-nippon.onrender.com/

## 🔧 Variáveis de Ambiente no Render

Vá em: **Dashboard → Seu Web Service → Environment**

Configure estas variáveis:

```
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://admin:SUA_SENHA@trello.addxhjn.mongodb.net/trello-nippon?retryWrites=true&w=majority&appName=Trello

# JWT Secret (MUDE para algo aleatório!)
JWT_SECRET=trello_render_production_secret_key_12345_MUDE_ISTO

# URL do Frontend (SUA URL DO RENDER)
FRONTEND_URL=https://trello-nippon.onrender.com

# Email (OPCIONAL - Configure depois se quiser)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
```

## 🔄 Rebuild Necessário

Após adicionar as variáveis:

1. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
2. Aguarde o deploy terminar
3. Acesse: https://trello-nippon.onrender.com/

## ✅ Tudo Deve Funcionar!

- ✅ Frontend em: https://trello-nippon.onrender.com/
- ✅ API em: https://trello-nippon.onrender.com/api
- ✅ Health check: https://trello-nippon.onrender.com/api/health

---

**Pronto para usar em produção! 🎉**

