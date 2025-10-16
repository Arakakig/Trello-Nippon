const nodemailer = require('nodemailer');

// Configuração do transportador de email
const createTransporter = () => {
  // Verificar se as credenciais de email estão configuradas
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Credenciais de email não configuradas. Emails não serão enviados.');
    console.warn('   Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no arquivo .env');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true para porta 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Função para enviar email de verificação
const sendVerificationEmail = async (user, verificationToken) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Email de verificação não enviado (serviço não configurado)');
    return { success: false, message: 'Serviço de email não configurado' };
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"Trello Nippon" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '✅ Confirme seu email - Trello Nippon',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao Trello Nippon!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${user.name}!</h2>
            <p>Obrigado por se cadastrar no Trello Nippon. Para começar a usar todas as funcionalidades, precisamos confirmar seu endereço de email.</p>
            
            <p>Clique no botão abaixo para verificar seu email:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Meu Email</a>
            </div>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p><strong>Este link expira em 24 horas.</strong></p>
            
            <p>Se você não criou uma conta no Trello Nippon, ignore este email.</p>
            
            <hr style="border: none; border-top: 1px solid #d1d5db; margin: 20px 0;">
            
            <p>Após verificar seu email, você poderá:</p>
            <ul>
              <li>✅ Criar e gerenciar projetos</li>
              <li>✅ Organizar tarefas no Kanban</li>
              <li>✅ Colaborar com sua equipe</li>
              <li>✅ Acompanhar prazos no calendário</li>
            </ul>
          </div>
          <div class="footer">
            <p>Trello Nippon - Gerenciamento de Tarefas</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Olá, ${user.name}!
      
      Bem-vindo ao Trello Nippon! Para confirmar seu email, acesse o link abaixo:
      
      ${verificationUrl}
      
      Este link expira em 24 horas.
      
      Se você não criou uma conta no Trello Nippon, ignore este email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de verificação enviado para: ${user.email}`);
    return { success: true, message: 'Email enviado com sucesso' };
  } catch (error) {
    console.warn('⚠️  Não foi possível enviar email:', error.code || error.message);
    console.log('   O sistema continuará funcionando sem verificação de email.');
    return { success: false, message: 'Email não enviado (SMTP bloqueado)', error };
  }
};

// Função para reenviar email de verificação
const resendVerificationEmail = async (user, verificationToken) => {
  return await sendVerificationEmail(user, verificationToken);
};

module.exports = {
  sendVerificationEmail,
  resendVerificationEmail,
};

