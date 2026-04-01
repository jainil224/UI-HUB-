import nodemailer from 'nodemailer';

/**
 * Sends a welcome email via Brevo SMTP.
 * 
 * @param {string} email - The user's registered email address.
 * @param {string} name - The user's name (optional).
 */
export const sendWelcomeEmail = async (email, name = 'there') => {
  try {
    // Brevo SMTP credentials should be set in Firebase Config or Secrets
    // For Cloud Functions, we'll use process.env.BREVO_SMTP_USER and process.env.BREVO_SMTP_PASS
    
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
      console.error('[EmailService] Missing SMTP credentials! Set them with firebase functions:secrets:set');
      return { success: false, error: 'Missing SMTP credentials' };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    const userName = name || email.split('@')[0];

    // Modern, Premium HTML Email Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to UI HUB</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #050505; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden; }
        .header { padding: 40px; text-align: center; border-bottom: 1px solid #222; }
        .logo { font-size: 28px; font-weight: 800; color: #fff; text-decoration: none; }
        .logo span { background: linear-gradient(to right, #00d2ff, #3a7bd5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .content { padding: 40px; line-height: 1.6; }
        .welcome-text { font-size: 24px; font-weight: 700; margin-bottom: 20px; }
        .body-text { color: #a0a0a0; font-size: 16px; margin-bottom: 30px; }
        .cta-button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); color: #fff; text-decoration: none; font-weight: 600; border-radius: 8px; }
        .footer { padding: 30px; text-align: center; font-size: 12px; color: #555; background: #0a0a0a; border-top: 1px solid #1a1a1a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="https://ui-hub.vercel.app" class="logo">UI <span>HUB</span></a>
        </div>
        <div class="content">
          <h1 class="welcome-text">Welcome to the future, ${userName}! 🚀</h1>
          <p class="body-text">
            We're thrilled to have you at <strong>UI HUB</strong>. You've just gained access to a curated collection of premium, modern UI components.
          </p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://ui-hub.vercel.app/library" class="cta-button">Explore Library</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 UI HUB. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"UI HUB" <${process.env.BREVO_SMTP_USER}>`,
      to: email,
      subject: 'Welcome to UI HUB 🚀',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};
