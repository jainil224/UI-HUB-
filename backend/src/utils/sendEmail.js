import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let cachedTransporter = null;
let cachedFromAddress = null;

// FIX 2 + FIX 4: startup credential log and hardened TLS (no rejectUnauthorized: false)
function getTransporter() {
  if (cachedTransporter) {
    return { transporter: cachedTransporter, fromAddress: cachedFromAddress };
  }

  const user   = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
  const pass   = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;
  const host   = process.env.SMTP_HOST   || 'smtp-relay.brevo.com';
  const port   = parseInt(process.env.SMTP_PORT || '587');

  // Port 465 is SMTPS (direct SSL), Port 587/2525 is STARTTLS
  const secure = port === 465 || process.env.SMTP_SECURE === 'true';

  // Startup validation — surfaces misconfiguration in Render logs immediately
  console.log('[EmailService] SMTP User loaded:', !!(user));
  if (!user || !pass) {
    throw new Error(
      '[EmailService] BREVO_SMTP_USER (or SMTP_USER) / BREVO_SMTP_PASS (or SMTP_PASS) is not set in environment variables.'
    );
  }

  // SMTP_FROM must be a Brevo-verified sender domain — never a Gmail address
  cachedFromAddress = process.env.SMTP_FROM || user;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    pool: true,       // Reuse connections for efficiency
    maxConnections: 5,
    maxMessages: 100,
    auth: { user, pass },
    // FIX 4: Removed rejectUnauthorized: false — security vulnerability
    // Use servername hint instead so Brevo's cert is correctly validated
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    tls: {
      minVersion: 'TLSv1.2',
      servername: 'smtp-relay.brevo.com',
    },
    logger: false,
    debug: false,
  });

  return { transporter: cachedTransporter, fromAddress: cachedFromAddress };
}

/**
 * Sends the UI-HUB branded welcome email.
 * Idempotency is guarded by the Firestore `welcomeEmailSent` flag in userRoutes.js.
 */
export async function sendWelcomeEmail(email, name) {
  let transporter, fromAddress;

  try {
    ({ transporter, fromAddress } = getTransporter());
  } catch (err) {
    console.error('[EmailService] Transporter init failed:', err.message);
    return { success: false, error: err.message };
  }

  const displayName = name || 'there';

  const mailOptions = {
    from:    `"UI-HUB" <${fromAddress}>`,
    to:      email,
    replyTo: 'uihub.design@gmail.com',
    subject: 'Welcome to UI-HUB — Your components are ready 🎨',
    html:    buildWelcomeEmailHTML(displayName),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✅ Welcome email sent to ${email} — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] ❌ Failed to send to ${email}:`, {
      message:      err.message,
      code:         err.code,
      response:     err.response,
      responseCode: err.responseCode,
    });
    return { success: false, error: err.message };
  }
}

function buildWelcomeEmailHTML(name) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to UI-HUB</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0F0F0F; font-family: 'DM Sans', sans-serif; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1A1A1A; border-radius:16px; overflow:hidden; border: 1px solid #2A2A2A;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C6AF7 0%, #F472B6 100%); padding: 32px 40px; text-align: center;">
              <div style="font-family:'Space Mono',monospace; font-size:28px; font-weight:700; color:#fff; letter-spacing:-1px;">
                UI<span style="color:#0F0F0F;">-</span>HUB
              </div>
              <div style="color:rgba(255,255,255,0.8); font-size:13px; margin-top:6px; letter-spacing:1px; text-transform:uppercase;">
                Component Library
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 32px;">
              <h1 style="font-size:24px; font-weight:700; color:#fff; margin-bottom:12px;">
                Welcome, ${name}! 👋
              </h1>
              <p style="color:#9CA3AF; font-size:15px; line-height:1.7; margin-bottom:24px;">
                Your UI-HUB account is ready. You now have access to our growing library of 
                beautifully crafted React components — copy, paste, ship.
              </p>

              <!-- CTA -->
              <div style="text-align:center; margin-bottom:32px;">
                <a href="${process.env.FRONTEND_URL || 'https://uihub.design'}"
                   style="display:inline-block; background: linear-gradient(135deg, #7C6AF7, #F472B6);
                          color:#fff; text-decoration:none; font-weight:700; font-size:15px;
                          padding:14px 36px; border-radius:8px; letter-spacing:0.3px;">
                  Explore Components →
                </a>
              </div>

              <p style="color:#4B5563; font-size:13px; text-align:center; line-height:1.6;">
                Questions? Reply to this email or reach us at
                <a href="mailto:uihub.design@gmail.com" style="color:#7C6AF7;">uihub.design@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #2A2A2A; text-align:center;">
              <p style="color:#374151; font-size:12px;">
                © ${new Date().getFullYear()} UI-HUB · You're receiving this because you signed up at uihub.design
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
