import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Builds the responsive Neo-Brutalist / UI-HUB styled HTML template for the welcome email.
 * @param {string} name
 * @returns {string} HTML content
 */
export function buildWelcomeEmailHtml(name) {
    const displayName = (name && name !== 'there') ? name : 'Creator';
    const frontendUrl = process.env.FRONTEND_URL || 'https://ui-hub-design.vercel.app';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to UI-HUB</title>
</head>
<body style="margin:0; padding:0; background-color:#08080A; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#FFFFFF; -webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#08080A; padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#111116; border:2px solid #FFFFFF; border-radius:14px; box-shadow:8px 8px 0px #000000; overflow:hidden;">
          
          <!-- Terminal-Style Top Bar -->
          <tr>
            <td style="background-color:#16161D; padding:14px 24px; border-bottom:2px solid #FFFFFF;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left">
                    <span style="display:inline-block; width:11px; height:11px; border-radius:50%; background-color:#FF3B30; border:1.5px solid #000000; margin-right:4px;"></span>
                    <span style="display:inline-block; width:11px; height:11px; border-radius:50%; background-color:#FFC700; border:1.5px solid #000000; margin-right:4px;"></span>
                    <span style="display:inline-block; width:11px; height:11px; border-radius:50%; background-color:#3D5CFF; border:1.5px solid #000000; margin-right:10px;"></span>
                    <span style="font-family:monospace; font-size:11px; font-weight:800; color:#A1A1AA; letter-spacing:1.5px;">UI-HUB // SYSTEM_VERIFIED</span>
                  </td>
                  <td align="right">
                    <span style="background-color:#FFC700; color:#000000; font-size:9px; font-weight:900; padding:3px 8px; border-radius:4px; border:1.5px solid #000000; text-transform:uppercase; letter-spacing:1px;">
                      LIVE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(180deg, #3D5CFF 0%, #2A44D4 100%); padding:40px 32px; text-align:center; border-bottom:2px solid #FFFFFF;">
              <div style="display:inline-block; background-color:#000000; color:#FFFFFF; font-size:10px; font-weight:900; padding:4px 12px; border-radius:4px; border:1px solid #FFFFFF; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
                THE FUTURE OF UI
              </div>
              <div style="font-size:36px; font-weight:900; color:#FFFFFF; letter-spacing:3px; text-transform:uppercase; margin:0; line-height:1;">
                UI-HUB
              </div>
              <div style="color:rgba(255,255,255,0.9); font-size:12px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; margin-top:10px;">
                Cinema-Grade UI Components & 3D Blueprints
              </div>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding:40px 36px 36px 36px;">
              
              <!-- Greeting & Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <span style="background-color:#FFC700; color:#000000; font-size:10px; font-weight:900; padding:4px 10px; border-radius:4px; border:1.5px solid #000000; text-transform:uppercase; letter-spacing:1px; display:inline-block; margin-bottom:14px;">
                      ⚡ VERIFIED MEMBER
                    </span>
                    <h1 style="font-size:26px; font-weight:900; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 12px 0; line-height:1.2;">
                      WELCOME TO UI-HUB, ${displayName.toUpperCase()}!
                    </h1>
                    <p style="color:#A1A1AA; font-size:15px; line-height:1.7; margin:0; font-weight:500;">
                      Your access is verified and ready. You can now explore, copy, and deploy our collection of cinema-grade React animations, 3D canvases, and AI-powered master blueprints.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature Highlights Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0; background-color:#16161D; border:2px solid #FFFFFF; border-radius:10px; box-shadow:5px 5px 0px #000000;">
                <tr>
                  <td style="padding:22px 20px;">
                    <div style="font-size:11px; font-family:monospace; font-weight:800; color:#3D5CFF; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:16px;">
                      // WHAT'S WAITING IN YOUR VAULT:
                    </div>

                    <!-- Item 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:26px; height:26px; background-color:#3D5CFF; border:1.5px solid #000000; border-radius:4px; text-align:center; line-height:26px; font-size:14px;">
                            🔥
                          </div>
                        </td>
                        <td style="font-size:14px; color:#FFFFFF; font-weight:800;">
                          100+ Production-Ready Components
                          <div style="font-size:12px; color:#A1A1AA; font-weight:400; line-height:1.5; margin-top:2px;">
                            3D models, smooth scroll sequences, and interactive visual effects.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:26px; height:26px; background-color:#FFC700; border:1.5px solid #000000; border-radius:4px; text-align:center; line-height:26px; font-size:14px;">
                            ⚡
                          </div>
                        </td>
                        <td style="font-size:14px; color:#FFFFFF; font-weight:800;">
                          Master AI Vibe Prompts
                          <div style="font-size:12px; color:#A1A1AA; font-weight:400; line-height:1.5; margin-top:2px;">
                            System blueprints engineered for Claude, Cursor, and ChatGPT code gen.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:26px; height:26px; background-color:#FF3B30; border:1.5px solid #000000; border-radius:4px; text-align:center; line-height:26px; font-size:14px;">
                            📦
                          </div>
                        </td>
                        <td style="font-size:14px; color:#FFFFFF; font-weight:800;">
                          Zero-Config Copy & Paste
                          <div style="font-size:12px; color:#A1A1AA; font-weight:400; line-height:1.5; margin-top:2px;">
                            Pure Tailwind CSS + TypeScript with full prop tables and demo sandbox.
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Big Primary Brutalist CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:36px 0 28px 0; text-align:center;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/library"
                       style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF; text-decoration:none; font-weight:900; font-size:15px; padding:18px 40px; border-radius:8px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px; box-shadow:6px 6px 0px #000000;">
                      EXPLORE COMPONENT LIBRARY →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Quick Command Snippet -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#08080B; border:1.5px solid #27272F; border-radius:6px; margin-top:20px;">
                <tr>
                  <td style="padding:14px 18px; font-family:monospace; font-size:12px; color:#A1A1AA;">
                    <span style="color:#3D5CFF; font-weight:bold;">$</span> npx @uihub/cli explore
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color:#0C0C10; padding:32px; border-top:2px solid #FFFFFF; text-align:center;">
              
              <!-- Quick Navigation Links -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td align="center" style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">
                    <a href="${frontendUrl}/library" style="color:#A1A1AA; text-decoration:none; margin:0 12px;">Library</a>
                    <span style="color:#3F3F46;">•</span>
                    <a href="${frontendUrl}/pricing" style="color:#A1A1AA; text-decoration:none; margin:0 12px;">Pricing</a>
                    <span style="color:#3F3F46;">•</span>
                    <a href="https://github.com/jainil224/UI-HUB-" style="color:#A1A1AA; text-decoration:none; margin:0 12px;">GitHub</a>
                  </td>
                </tr>
              </table>

              <!-- Status Badge -->
              <div style="display:inline-block; background-color:#16161D; border:1.5px solid #27272F; border-radius:4px; padding:5px 14px; margin-bottom:18px;">
                <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background-color:#3D5CFF; margin-right:8px;"></span>
                <span style="font-size:10px; font-weight:900; color:#FFFFFF; text-transform:uppercase; letter-spacing:1px;">ALL SYSTEMS LIVE</span>
              </div>

              <!-- Copyright -->
              <p style="color:#52525B; font-size:11px; line-height:1.6; margin:0;">
                © ${new Date().getFullYear()} UI-HUB · Built for vibe coders.<br/>
                You received this email because you created an account on UI-HUB.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
}

/**
 * Sends a welcome email via Brevo HTTP Transactional Email API (v3).
 * Supports both object signature ({ email, name }) and positional args (email, name).
 *
 * @param {string | { email: string, name?: string }} target
 * @param {string} [optionalName]
 * @returns {Promise<{ success: boolean, messageId?: string, error?: any }>}
 */
export async function sendWelcomeEmail(target, optionalName) {
    let email, name;
    if (typeof target === 'object' && target !== null) {
        email = target.email;
        name = target.name;
    } else {
        email = target;
        name = optionalName;
    }

    if (!email) {
        console.error('[BrevoService] ❌ No recipient email provided.');
        return { success: false, error: 'Recipient email is required' };
    }

    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.BREVO_SMTP_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'UI-HUB';

    if (!apiKey) {
        const err = 'BREVO_API_KEY is not set in environment variables.';
        console.error(`[BrevoService] ⚠️  ${err}`);
        return { success: false, error: err };
    }

    if (!senderEmail) {
        const err = 'BREVO_SENDER_EMAIL is not set in environment variables.';
        console.error(`[BrevoService] ⚠️  ${err}`);
        return { success: false, error: err };
    }

    const payload = {
        sender: {
            name: senderName,
            email: senderEmail,
        },
        to: [
            {
                email: email,
                name: name || 'there',
            },
        ],
        subject: 'Welcome to UI-HUB 🎉',
        htmlContent: buildWelcomeEmailHtml(name),
    };

    try {
        console.log(`[BrevoService] Sending welcome email to: ${email} via HTTP API...`);
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            payload,
            {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                timeout: 15000,
            }
        );

        const messageId = response.data?.messageId || response.data?.messageIds?.[0] || 'sent';
        console.log(`[BrevoService] ✅ Welcome email sent successfully to ${email} | messageId: ${messageId}`);
        return { success: true, messageId, data: response.data };
    } catch (error) {
        const brevoError = error.response?.data || error.message;
        const status = error.response?.status;

        if (status === 429) {
            console.warn(`[BrevoService] ⚠️ Rate limit / quota exceeded (429):`, brevoError);
        } else {
            console.error(`[BrevoService] ❌ Failed to send welcome email to ${email} (status ${status || 'ERR'}):`, brevoError);
        }

        return {
            success: false,
            error: typeof brevoError === 'object' ? JSON.stringify(brevoError) : brevoError,
            status,
        };
    }
}

export default {
    sendWelcomeEmail,
    buildWelcomeEmailHtml,
};
