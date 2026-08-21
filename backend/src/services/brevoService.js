import axios from 'axios';

/**
 * Builds the UI-HUB signature 3-color neo-brutalist strip.
 */
function buildColorStrip() {
    return `
      <tr>
        <td style="padding:0; height:6px; line-height:6px; font-size:0; border-top:1px solid #000000; border-bottom:1px solid #000000;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; height:6px;">
            <tr>
              <td width="33.33%" style="background-color:#FFFFFF; height:6px; border-right:1px solid #000000;"></td>
              <td width="33.33%" style="background-color:#3D5CFF; height:6px; border-right:1px solid #000000;"></td>
              <td width="33.34%" style="background-color:#FF3B30; height:6px;"></td>
            </tr>
          </table>
        </td>
      </tr>
    `;
}

/**
 * Builds the UI-HUB Welcome Email HTML with the Slotify-style high-contrast neo-brutalist layout.
 *
 * @param {string} name Display name of the user
 * @returns {string} HTML content
 */
export function buildWelcomeEmailHtml(name) {
    const displayName = (name && name !== 'there') ? name : 'Creator';
    const frontendUrl = process.env.FRONTEND_URL || 'https://ui-hub-design.vercel.app';
    const libraryUrl = `${frontendUrl}/library`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to UI-HUB</title>
</head>
<body style="margin:0; padding:0; background-color:#0D0D11; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#000000; -webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D11; padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%; background-color:#FFFFFF; border:2px solid #000000; border-radius:6px; box-shadow:8px 8px 0px #000000; overflow:hidden;">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="background-color:#000000; padding:26px 20px; text-align:center;">
              <div style="font-size:26px; font-weight:900; color:#FFFFFF; letter-spacing:4px; text-transform:uppercase; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
                UI-HUB
              </div>
            </td>
          </tr>

          <!-- Signature Color Strip (Red, Blue, Yellow) -->
          ${buildColorStrip()}

          <!-- Card Content Body -->
          <tr>
            <td style="padding:36px 32px 28px 32px; background-color:#FFFFFF; text-align:left;">
              
              <!-- Badge -->
              <div style="margin-bottom:20px;">
                <span style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF; font-size:10px; font-weight:900; padding:5px 12px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px;">
                  ACCOUNT ACTIVATION
                </span>
              </div>

              <!-- Main Title -->
              <h1 style="font-size:26px; font-weight:900; color:#000000; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 14px 0; line-height:1.2;">
                WELCOME TO UI-HUB
              </h1>

              <!-- Greeting & Copy -->
              <p style="font-size:15px; color:#222222; line-height:1.6; margin:0 0 16px 0; font-weight:500;">
                Hi <strong>${displayName}</strong>, your account is activated and ready to ship.
              </p>

              <p style="font-size:14px; color:#444444; line-height:1.6; margin:0 0 28px 0;">
                Thank you for joining UI-HUB! Click the button below to explore our cinema-grade React component library, 3D interactive canvases, and AI-powered master prompts:
              </p>

              <!-- Brutalist Primary Action Button -->
              <div style="margin:28px 0 28px 0;">
                <a href="${libraryUrl}"
                   style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF; text-decoration:none; font-weight:900; font-size:14px; padding:16px 36px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px; box-shadow:5px 5px 0px #000000;">
                  EXPLORE COMPONENT LIBRARY →
                </a>
              </div>

              <!-- Link Fallback Box -->
              <p style="font-size:12px; color:#666666; margin:0 0 8px 0;">
                Or copy and paste this link in your browser:
              </p>
              <div style="background-color:#F1F5F9; border:1.5px solid #000000; padding:12px 14px; font-family:monospace; font-size:12px; color:#2563EB; word-break:break-all; margin-bottom:24px;">
                <a href="${libraryUrl}" style="color:#2563EB; text-decoration:underline;">${libraryUrl}</a>
              </div>

              <!-- Yellow Notice Box -->
              <div style="background-color:#FEF9C3; border:2px solid #000000; padding:14px 16px; margin-bottom:28px; box-shadow:3px 3px 0px #000000;">
                <p style="margin:0; font-size:12px; color:#000000; font-weight:600; line-height:1.5;">
                  ⚡ <strong>Tip:</strong> All free components come with zero dependency bloat. Instant copy-paste for Tailwind CSS and React!
                </p>
              </div>

              <!-- Sign-off -->
              <p style="font-size:13px; color:#444444; margin:0 0 4px 0;">Best regards,</p>
              <p style="font-size:14px; color:#000000; font-weight:900; margin:0;">The UI-HUB Engineering Team</p>

            </td>
          </tr>

          <!-- Dark Footer -->
          <tr>
            <td style="background-color:#000000; padding:24px 20px; text-align:center;">
              <p style="color:#FFFFFF; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin:0 0 6px 0;">
                © ${new Date().getFullYear()} UI-HUB COMPONENT PLATFORM
              </p>
              <p style="color:#71717A; font-size:9px; letter-spacing:1.5px; text-transform:uppercase; margin:0;">
                CINEMA-GRADE UI • MASTER AI PROMPTS • ZERO BLOAT
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

/**
 * Builds the FREE Subscription Confirmation Email with the Slotify-style high-contrast neo-brutalist layout.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string|Date} [params.activatedAt]
 * @returns {string} HTML content
 */
export function buildFreeSubscriptionEmailHtml({ name, email, activatedAt = new Date() }) {
    const displayName = (name && name !== 'there') ? name : 'Creator';
    const frontendUrl = process.env.FRONTEND_URL || 'https://ui-hub-design.vercel.app';
    const libraryUrl = `${frontendUrl}/library`;
    const formattedDate = new Date(activatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your FREE UI-HUB Subscription is Active</title>
</head>
<body style="margin:0; padding:0; background-color:#0D0D11; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#000000; -webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D11; padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%; background-color:#FFFFFF; border:2px solid #000000; border-radius:6px; box-shadow:8px 8px 0px #000000; overflow:hidden;">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="background-color:#000000; padding:26px 20px; text-align:center;">
              <div style="font-size:26px; font-weight:900; color:#FFFFFF; letter-spacing:4px; text-transform:uppercase; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
                UI-HUB
              </div>
            </td>
          </tr>

          <!-- Signature Color Strip (Red, Blue, Yellow) -->
          ${buildColorStrip()}

          <!-- Card Content Body -->
          <tr>
            <td style="padding:36px 32px 28px 32px; background-color:#FFFFFF; text-align:left;">
              
              <!-- Badge -->
              <div style="margin-bottom:20px;">
                <span style="display:inline-block; background-color:#00FF1A; color:#000000; font-size:10px; font-weight:900; padding:5px 12px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px;">
                  FREE SUBSCRIPTION ACTIVE
                </span>
              </div>

              <!-- Main Title -->
              <h1 style="font-size:26px; font-weight:900; color:#000000; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 14px 0; line-height:1.2;">
                YOUR FREE PLAN IS CONFIRMED
              </h1>

              <!-- Greeting & Copy -->
              <p style="font-size:15px; color:#222222; line-height:1.6; margin:0 0 16px 0; font-weight:500;">
                Hi <strong>${displayName}</strong>, your <strong>FREE Subscription</strong> is now active.
              </p>

              <p style="font-size:14px; color:#444444; line-height:1.6; margin:0 0 24px 0;">
                You now have unlimited access to our collection of open-source React components, starter blueprints, and AI prompt trials.
              </p>

              <!-- Subscription Info Table Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC; border:2px solid #000000; margin-bottom:24px; box-shadow:3px 3px 0px #000000;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-family:monospace; font-size:10px; font-weight:900; color:#3D5CFF; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px;">
                      // SUBSCRIPTION DETAILS
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Plan:</td>
                        <td align="right" style="padding:4px 0; font-size:13px; color:#000000; font-weight:900;">FREE (Starter)</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Account:</td>
                        <td align="right" style="padding:4px 0; font-size:13px; color:#000000; font-weight:800;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Billing:</td>
                        <td align="right" style="padding:4px 0; font-size:13px; color:#059669; font-weight:900;">$0.00 (Free Forever)</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Status:</td>
                        <td align="right" style="padding:4px 0; font-size:13px; color:#000000; font-weight:800;">Active / Unlimited</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Brutalist Primary Action Button -->
              <div style="margin:24px 0 24px 0;">
                <a href="${libraryUrl}"
                   style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF; text-decoration:none; font-weight:900; font-size:14px; padding:16px 36px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px; box-shadow:5px 5px 0px #000000;">
                  START BROWSING FREE COMPONENTS →
                </a>
              </div>

              <!-- Link Fallback Box -->
              <p style="font-size:12px; color:#666666; margin:0 0 8px 0;">
                Or copy and paste this link in your browser:
              </p>
              <div style="background-color:#F1F5F9; border:1.5px solid #000000; padding:12px 14px; font-family:monospace; font-size:12px; color:#2563EB; word-break:break-all; margin-bottom:24px;">
                <a href="${libraryUrl}" style="color:#2563EB; text-decoration:underline;">${libraryUrl}</a>
              </div>

              <!-- Yellow Notice Box -->
              <div style="background-color:#FEF9C3; border:2px solid #000000; padding:14px 16px; margin-bottom:28px; box-shadow:3px 3px 0px #000000;">
                <p style="margin:0; font-size:12px; color:#000000; font-weight:600; line-height:1.5;">
                  ⚡ <strong>Notice:</strong> This is a 100% Free plan. No credit card or payment receipt is required. Upgrade to PRO anytime to unlock 3D assets & ZIP downloads!
                </p>
              </div>

              <!-- Sign-off -->
              <p style="font-size:13px; color:#444444; margin:0 0 4px 0;">Best regards,</p>
              <p style="font-size:14px; color:#000000; font-weight:900; margin:0;">The UI-HUB Engineering Team</p>

            </td>
          </tr>

          <!-- Dark Footer -->
          <tr>
            <td style="background-color:#000000; padding:24px 20px; text-align:center;">
              <p style="color:#FFFFFF; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin:0 0 6px 0;">
                © ${new Date().getFullYear()} UI-HUB COMPONENT PLATFORM
              </p>
              <p style="color:#71717A; font-size:9px; letter-spacing:1.5px; text-transform:uppercase; margin:0;">
                CINEMA-GRADE UI • MASTER AI PROMPTS • ZERO BLOAT
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

/**
 * Builds the PRO Subscription Confirmation Email with the Slotify-style high-contrast neo-brutalist layout and PDF receipt attached notice.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {number|string} params.amount
 * @param {string} [params.currency]
 * @param {string} params.paymentId
 * @param {string} params.orderId
 * @param {string|Date} [params.purchaseDate]
 * @param {string} [params.duration]
 * @returns {string} HTML content
 */
export function buildProSubscriptionEmailHtml({
    name,
    email,
    amount,
    currency = 'USD',
    paymentId,
    orderId,
    purchaseDate = new Date(),
    duration = '6 Months'
}) {
    const displayName = (name && name !== 'there') ? name : 'Pro Creator';
    const frontendUrl = process.env.FRONTEND_URL || 'https://ui-hub-design.vercel.app';
    const libraryUrl = `${frontendUrl}/library`;
    const currencyPrefix = currency === 'INR' ? '₹' : '$';
    const formattedAmount = `${currencyPrefix}${Number(amount || 0).toFixed(2)}`;
    const formattedDate = new Date(purchaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to PRO ACCESS</title>
</head>
<body style="margin:0; padding:0; background-color:#0D0D11; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#000000; -webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D11; padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%; background-color:#FFFFFF; border:2px solid #000000; border-radius:6px; box-shadow:8px 8px 0px #000000; overflow:hidden;">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="background-color:#000000; padding:26px 20px; text-align:center;">
              <div style="font-size:26px; font-weight:900; color:#FFFFFF; letter-spacing:4px; text-transform:uppercase; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
                UI-HUB
              </div>
            </td>
          </tr>

          <!-- Signature Color Strip (Red, Blue, Yellow) -->
          ${buildColorStrip()}

          <!-- Card Content Body -->
          <tr>
            <td style="padding:36px 32px 28px 32px; background-color:#FFFFFF; text-align:left;">
              
              <!-- Badge -->
              <div style="margin-bottom:20px;">
                <span style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF; font-size:10px; font-weight:900; padding:5px 12px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px;">
                  PRO ACCESS ACTIVATED
                </span>
              </div>

              <!-- Main Title -->
              <h1 style="font-size:26px; font-weight:900; color:#000000; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 14px 0; line-height:1.2;">
                WELCOME TO PRO ACCESS, ${displayName.toUpperCase()}! 🚀
              </h1>

              <!-- Greeting & Copy -->
              <p style="font-size:15px; color:#222222; line-height:1.6; margin:0 0 16px 0; font-weight:500;">
                Your payment was <strong style="color:#059669;">successfully verified</strong>. Your UI-HUB account has been upgraded to <strong>PRO ACCESS</strong> for <strong>${duration}</strong>.
              </p>

              <!-- Payment Summary Table Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC; border:2px solid #000000; margin-bottom:24px; box-shadow:3px 3px 0px #000000;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-family:monospace; font-size:10px; font-weight:900; color:#3D5CFF; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px;">
                      // TRANSACTION & RECEIPT SUMMARY
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Plan:</td>
                        <td align="right" style="padding:4px 0; font-size:13px; color:#000000; font-weight:900;">PRO ACCESS (${duration})</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Amount Paid:</td>
                        <td align="right" style="padding:4px 0; font-size:13px; color:#059669; font-weight:900;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Payment ID:</td>
                        <td align="right" style="padding:4px 0; font-size:12px; font-family:monospace; color:#000000; font-weight:800;">${paymentId}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; font-size:13px; color:#64748B; font-weight:600;">Date:</td>
                        <td align="right" style="padding:4px 0; font-size:13px; color:#000000; font-weight:800;">${formattedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Brutalist Primary Action Button -->
              <div style="margin:24px 0 24px 0;">
                <a href="${libraryUrl}"
                   style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF; text-decoration:none; font-weight:900; font-size:14px; padding:16px 36px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px; box-shadow:5px 5px 0px #000000;">
                  LAUNCH PRO LIBRARY & DOWNLOADS →
                </a>
              </div>

              <!-- Green Attached Receipt Notice Box -->
              <div style="background-color:#ECFDF5; border:2px solid #000000; padding:14px 16px; margin-bottom:28px; box-shadow:3px 3px 0px #000000;">
                <p style="margin:0; font-size:12px; color:#065F46; font-weight:700; line-height:1.5;">
                  📎 <strong>PDF PAYMENT RECEIPT ATTACHED:</strong> Your official payment receipt has been generated and attached to this email as a PDF. Please retain it for your accounting records.
                </p>
              </div>

              <!-- Sign-off -->
              <p style="font-size:13px; color:#444444; margin:0 0 4px 0;">Best regards,</p>
              <p style="font-size:14px; color:#000000; font-weight:900; margin:0;">The UI-HUB Engineering Team</p>

            </td>
          </tr>

          <!-- Dark Footer -->
          <tr>
            <td style="background-color:#000000; padding:24px 20px; text-align:center;">
              <p style="color:#FFFFFF; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin:0 0 6px 0;">
                © ${new Date().getFullYear()} UI-HUB COMPONENT PLATFORM
              </p>
              <p style="color:#71717A; font-size:9px; letter-spacing:1.5px; text-transform:uppercase; margin:0;">
                CINEMA-GRADE UI • MASTER AI PROMPTS • ZERO BLOAT
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

/**
 * Sends the Welcome Email via Brevo HTTP API (v3).
 */
export async function sendWelcomeEmail(email, name) {
    if (!email) return { success: false, error: 'Recipient email is required' };

    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.BREVO_SMTP_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'UI-HUB';

    if (!apiKey || !senderEmail) return { success: false, error: 'Brevo credentials missing' };

    const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: name || 'there' }],
        replyTo: { email: 'uihub.design@gmail.com', name: 'UI-HUB Support' },
        subject: 'Welcome to UI-HUB — Your components are ready 🎨',
        htmlContent: buildWelcomeEmailHtml(name),
        textContent: `Welcome to UI-HUB, ${name || 'there'}!\n\nYour account is activated and ready to ship.\n\nExplore components: ${process.env.FRONTEND_URL || 'https://uihub.design'}/library\n\n© UI-HUB`,
    };

    try {
        console.log(`[BrevoService] Sending welcome email to: ${email} via HTTP API...`);
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            timeout: 15000,
        });

        const messageId = response.data?.messageId || response.data?.messageIds?.[0] || 'sent';
        console.log(`[BrevoService] ✅ Welcome email sent successfully to ${email} | messageId: ${messageId}`);
        return { success: true, messageId, data: response.data };
    } catch (error) {
        const brevoError = error.response?.data || error.message;
        console.error(`[BrevoService] ❌ Failed to send welcome email to ${email}:`, brevoError);
        return { success: false, error: typeof brevoError === 'object' ? JSON.stringify(brevoError) : brevoError };
    }
}

/**
 * Sends a FREE subscription confirmation email via Brevo HTTP API (v3).
 */
export async function sendFreeSubscriptionEmail({ email, name, activatedAt = new Date() }) {
    if (!email) return { success: false, error: 'Recipient email is required' };

    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.BREVO_SMTP_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'UI-HUB';

    if (!apiKey || !senderEmail) return { success: false, error: 'Brevo API credentials missing' };

    const frontendUrl = process.env.FRONTEND_URL || 'https://uihub.design';
    const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: name || 'there' }],
        replyTo: { email: 'uihub.design@gmail.com', name: 'UI-HUB Support' },
        subject: 'Your FREE UI-HUB Subscription is Active 🎨',
        htmlContent: buildFreeSubscriptionEmailHtml({ name, email, activatedAt }),
        textContent: `Hello ${name || 'there'},\n\nYour FREE UI-HUB Subscription is confirmed and active.\n\nPlan: FREE (Starter)\nEmail: ${email}\nStatus: Active / Unlimited\n\nStart browsing components: ${frontendUrl}/library\n\n© ${new Date().getFullYear()} UI-HUB`,
    };

    try {
        console.log(`[BrevoService] Sending FREE subscription email to: ${email}...`);
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            timeout: 15000,
        });

        const messageId = response.data?.messageId || response.data?.messageIds?.[0] || 'sent';
        console.log(`[BrevoService] ✅ FREE subscription email sent to ${email} | messageId: ${messageId}`);
        return { success: true, messageId, data: response.data };
    } catch (error) {
        const brevoError = error.response?.data || error.message;
        console.error(`[BrevoService] ❌ Failed to send FREE email to ${email}:`, brevoError);
        return { success: false, error: typeof brevoError === 'object' ? JSON.stringify(brevoError) : brevoError };
    }
}

/**
 * Sends a PRO subscription confirmation email with attached PDF payment receipt via Brevo HTTP API (v3).
 */
export async function sendProSubscriptionEmail({
    email,
    name,
    amount,
    currency = 'USD',
    paymentId,
    orderId,
    purchaseDate = new Date(),
    duration = '6 Months',
    pdfBuffer,
    receiptNumber
}) {
    if (!email) return { success: false, error: 'Recipient email is required' };

    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.BREVO_SMTP_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'UI-HUB';

    if (!apiKey || !senderEmail) return { success: false, error: 'Brevo API credentials missing' };

    const displayReceiptNo = receiptNumber || `UIHUB-${paymentId?.slice(-8).toUpperCase() || 'RECEIPT'}`;

    const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: name || 'there' }],
        replyTo: { email: 'support@uihub.design', name: 'UI-HUB Support' },
        subject: `Welcome to PRO ACCESS — Payment Confirmed & Receipt Attached 🚀`,
        htmlContent: buildProSubscriptionEmailHtml({
            name,
            email,
            amount,
            currency,
            paymentId,
            orderId,
            purchaseDate,
            duration,
        }),
        textContent: `Welcome to PRO ACCESS, ${name || 'there'}!\n\nYour payment of ${currency === 'INR' ? 'INR' : '$'} ${amount} has been verified.\nPayment ID: ${paymentId}\nOrder ID: ${orderId}\n\nYour official payment receipt is attached as a PDF.\n\nAccess PRO Library: ${process.env.FRONTEND_URL || 'https://uihub.design'}/library\n\n© ${new Date().getFullYear()} UI-HUB`,
        attachment: pdfBuffer ? [
            {
                name: `UI-HUB-Receipt-${displayReceiptNo}.pdf`,
                content: pdfBuffer.toString('base64'),
            }
        ] : [],
    };

    try {
        console.log(`[BrevoService] Sending PRO subscription email with receipt to: ${email}...`);
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            timeout: 20000,
        });

        const messageId = response.data?.messageId || response.data?.messageIds?.[0] || 'sent';
        console.log(`[BrevoService] ✅ PRO subscription email with receipt sent to ${email} | messageId: ${messageId}`);
        return { success: true, messageId, data: response.data };
    } catch (error) {
        const brevoError = error.response?.data || error.message;
        console.error(`[BrevoService] ❌ Failed to send PRO email to ${email}:`, brevoError);
        return { success: false, error: typeof brevoError === 'object' ? JSON.stringify(brevoError) : brevoError };
    }
}

export default {
    sendWelcomeEmail,
    sendFreeSubscriptionEmail,
    sendProSubscriptionEmail,
    buildWelcomeEmailHtml,
    buildFreeSubscriptionEmailHtml,
    buildProSubscriptionEmailHtml,
};
