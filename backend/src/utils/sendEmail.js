import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Reusable email utility for sending welcome emails via Brevo SMTP.
 * 
 * @param {string} email - The user's registered email address.
 * @param {string} name - The user's name (optional).
 */
export const sendWelcomeEmail = async (email, name = 'there') => {
  try {
    // Configure Brevo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for 465, false for other ports
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
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #050505;
          margin: 0;
          padding: 0;
          color: #ffffff;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          padding: 40px 20px;
          text-align: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #050505 100%);
          border-bottom: 1px solid #222;
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -1px;
          color: #fff;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 10px;
        }
        .logo span {
          background: linear-gradient(to right, #00d2ff, #3a7bd5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .content {
          padding: 40px;
          line-height: 1.6;
        }
        .welcome-text {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #fff;
        }
        .body-text {
          font-size: 16px;
          color: #a0a0a0;
          margin-bottom: 30px;
        }
        .cta-button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          border-radius: 8px;
          transition: transform 0.2s ease;
        }
        .footer {
          padding: 30px;
          text-align: center;
          font-size: 12px;
          color: #555;
          background: #0a0a0a;
          border-top: 1px solid #1a1a1a;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          color: #444;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="https://ui-hub.vercel.app" class="logo">UI <span>HUB</span></a>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">The Home of Vibe Coding & Premium UI</p>
        </div>
        <div class="content">
          <h1 class="welcome-text">Welcome to the future, ${userName}! 🚀</h1>
          <p class="body-text">
            We're thrilled to have you at <strong>UI HUB</strong>. You've just gained access to a curated collection of premium, modern UI components designed to make your web applications stand out.
          </p>
          <p class="body-text">
            Explore our library of 3D chatbots, sleek animations, and production-ready components that are ready to be dropped into your next project.
          </p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://ui-hub.vercel.app/library" class="cta-button">Explore Library</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 UI HUB. All rights reserved.</p>
          <p>You received this email because you signed up for UI HUB.</p>
          <div class="social-links">
            <a href="#">Twitter</a>
            <a href="#">GitHub</a>
            <a href="#">Discord</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"UI HUB" <uihub.design@gmail.com>`,
      to: email,
      subject: 'Welcome to UI HUB 🚀',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Error sending welcome email:', error);
    // Do not throw error to avoid blocking user signup flow
    return { success: false, error: error.message };
  }
};
