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
 * Builds the responsive Neo-Brutalist HTML template for the FREE subscription confirmation email.
 * Notice: Free subscriptions DO NOT have payment receipts attached.
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
                    <span style="font-family:monospace; font-size:11px; font-weight:800; color:#A1A1AA; letter-spacing:1.5px;">UI-HUB // PLAN: FREE</span>
                  </td>
                  <td align="right">
                    <span style="background-color:#FFFFFF; color:#000000; font-size:9px; font-weight:900; padding:3px 8px; border-radius:4px; border:1.5px solid #000000; text-transform:uppercase; letter-spacing:1px;">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(180deg, #1C1C24 0%, #111116 100%); padding:36px 32px; text-align:center; border-bottom:2px solid #FFFFFF;">
              <div style="display:inline-block; background-color:#00FF1A; color:#000000; font-size:10px; font-weight:900; padding:4px 12px; border-radius:4px; border:1.5px solid #000000; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
                ✓ SUBSCRIPTION ACTIVATED
              </div>
              <div style="font-size:32px; font-weight:900; color:#FFFFFF; letter-spacing:2px; text-transform:uppercase; margin:0; line-height:1.1;">
                FREE PLAN ACTIVE
              </div>
              <div style="color:#A1A1AA; font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-top:8px;">
                The Essential Foundation for Modern Creators
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="font-size:22px; font-weight:900; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 10px 0;">
                HELLO, ${displayName.toUpperCase()}! 👋
              </h2>
              <p style="color:#A1A1AA; font-size:14px; line-height:1.7; margin:0 0 24px 0; font-weight:500;">
                Your <strong style="color:#FFFFFF;">FREE Subscription</strong> is now confirmed and active. You have full access to our starter collection of open-source React components and foundational vibe prompts.
              </p>

              <!-- Subscription Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#16161D; border:2px solid #FFFFFF; border-radius:8px; margin-bottom:28px; box-shadow:4px 4px 0px #000000;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:10px; font-family:monospace; font-weight:800; color:#3D5CFF; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;">
                      // SUBSCRIPTION DETAILS
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Plan Name:</td>
                        <td align="right" style="padding:6px 0; font-size:13px; color:#00FF1A; font-weight:900;">FREE (Starter)</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Account Email:</td>
                        <td align="right" style="padding:6px 0; font-size:13px; color:#FFFFFF; font-weight:800;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Status:</td>
                        <td align="right" style="padding:6px 0; font-size:13px; color:#FFFFFF; font-weight:800;">Active / Unlimited</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Activation Date:</td>
                        <td align="right" style="padding:6px 0; font-size:13px; color:#FFFFFF; font-weight:800;">${formattedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Included Features List -->
              <div style="font-size:11px; font-family:monospace; font-weight:800; color:#FFC700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px;">
                // INCLUDED IN YOUR FREE TIER:
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ <strong>50+ Essential UI Components</strong> with React & Tailwind code
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ <strong>Starter Vault</strong> (save up to 5 projects)
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ <strong>2 Free AI Prompt Trials</strong> for Cursor & Lovable
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ Instant copy & paste into any web project
                  </td>
                </tr>
              </table>

              <!-- Action CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 16px 0; text-align:center;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/library"
                       style="display:inline-block; background-color:#FFFFFF; color:#000000; text-decoration:none; font-weight:900; font-size:14px; padding:16px 36px; border-radius:6px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.2px; box-shadow:5px 5px 0px #000000;">
                      START BROWSING FREE COMPONENTS →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color:#0C0C10; padding:28px 32px; border-top:2px solid #FFFFFF; text-align:center;">
              <p style="color:#71717A; font-size:11px; line-height:1.6; margin:0;">
                © ${new Date().getFullYear()} UI-HUB · No credit card required.<br/>
                Want to unlock all 100+ components and 3D assets? Upgrade to PRO anytime at <a href="${frontendUrl}/pricing" style="color:#3D5CFF; text-decoration:none; font-weight:700;">uihub.design/pricing</a>.
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
 * Builds the responsive Neo-Brutalist HTML template for the PRO subscription email with payment details.
 * Explicitly mentions that the PDF payment receipt is attached.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {number|string} params.amount
 * @param {string} params.currency
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
    const displayName = (name && name !== 'there') ? name : 'Principal Creator';
    const frontendUrl = process.env.FRONTEND_URL || 'https://ui-hub-design.vercel.app';
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const formattedAmount = `${currencySymbol}${Number(amount || 0).toFixed(2)}`;
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
  <title>Welcome to PRO ACCESS — UI-HUB Payment Receipt</title>
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
                    <span style="font-family:monospace; font-size:11px; font-weight:800; color:#A1A1AA; letter-spacing:1.5px;">UI-HUB // PRO_PAYMENT_CONFIRMED</span>
                  </td>
                  <td align="right">
                    <span style="background-color:#00FF1A; color:#000000; font-size:9px; font-weight:900; padding:3px 8px; border-radius:4px; border:1.5px solid #000000; text-transform:uppercase; letter-spacing:1px;">
                      VERIFIED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="background: linear-gradient(180deg, #3D5CFF 0%, #1D36BF 100%); padding:40px 32px; text-align:center; border-bottom:2px solid #FFFFFF;">
              <div style="display:inline-block; background-color:#000000; color:#00FF1A; font-size:10px; font-weight:900; padding:4px 12px; border-radius:4px; border:1.5px solid #00FF1A; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
                👑 PRO MEMBERSHIP ACTIVE
              </div>
              <div style="font-size:34px; font-weight:900; color:#FFFFFF; letter-spacing:2px; text-transform:uppercase; margin:0; line-height:1.1;">
                YOU'RE PRO NOW!
              </div>
              <div style="color:rgba(255,255,255,0.9); font-size:12px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin-top:8px;">
                Unlimited Access Unlocked for ${duration}
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="font-size:22px; font-weight:900; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 10px 0;">
                WELCOME TO PRO ACCESS, ${displayName.toUpperCase()}! 🚀
              </h2>
              <p style="color:#A1A1AA; font-size:14px; line-height:1.7; margin:0 0 24px 0; font-weight:500;">
                Your payment was <strong style="color:#00FF1A;">successfully verified</strong>. Your UI-HUB account has been immediately upgraded to PRO ACCESS. You now have unrestricted power to explore, download, and vibe-code with all premium components.
              </p>

              <!-- Payment Summary Table Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#16161D; border:2px solid #FFFFFF; border-radius:8px; margin-bottom:24px; box-shadow:4px 4px 0px #000000;">
                <tr>
                  <td style="padding:22px;">
                    <div style="font-size:10px; font-family:monospace; font-weight:800; color:#3D5CFF; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px;">
                      // TRANSACTION & PAYMENT RECEIPT
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Plan:</td>
                        <td align="right" style="padding:6px 0; font-size:13px; color:#FFFFFF; font-weight:900;">PRO ACCESS (${duration})</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Amount Paid:</td>
                        <td align="right" style="padding:6px 0; font-size:15px; color:#00FF1A; font-weight:900;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Payment Status:</td>
                        <td align="right" style="padding:6px 0; font-size:13px; color:#00FF1A; font-weight:900;">PAID / VERIFIED</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Payment Date:</td>
                        <td align="right" style="padding:6px 0; font-size:13px; color:#FFFFFF; font-weight:800;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Payment ID:</td>
                        <td align="right" style="padding:6px 0; font-size:12px; font-family:monospace; color:#A1A1AA;">${paymentId || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#A1A1AA; font-weight:600;">Order ID:</td>
                        <td align="right" style="padding:6px 0; font-size:12px; font-family:monospace; color:#A1A1AA;">${orderId || 'N/A'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PDF Attachment Notice Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1E1E28; border:2px solid #3D5CFF; border-radius:8px; margin-bottom:28px; box-shadow:4px 4px 0px #000000;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="middle">
                          <span style="font-size:22px;">📎</span>
                        </td>
                        <td>
                          <div style="font-size:13px; font-weight:900; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">
                            PDF PAYMENT RECEIPT ATTACHED
                          </div>
                          <div style="font-size:12px; color:#A1A1AA; margin-top:2px; font-weight:500;">
                            Your official payment receipt has been automatically generated and attached to this email as a PDF.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Unlocked Features -->
              <div style="font-size:11px; font-family:monospace; font-weight:800; color:#FFC700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px;">
                // UNLOCKED ON YOUR ACCOUNT:
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ <strong>Unlimited Downloads</strong> for all production code & ZIP files
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ <strong>Elite AI Prompts</strong> engineered for Antigravity, Claude 3.7 & Cursor
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ <strong>Cinema-Grade 3D Blueprints</strong> & interactive particle engines
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:13px; color:#E4E4E7; font-weight:600;">
                    ✓ <strong>100+ Premium Templates</strong> with lifetime updates
                  </td>
                </tr>
              </table>

              <!-- Big Primary CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0; text-align:center;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/library"
                       style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF; text-decoration:none; font-weight:900; font-size:15px; padding:18px 42px; border-radius:8px; border:2px solid #000000; text-transform:uppercase; letter-spacing:1.5px; box-shadow:6px 6px 0px #000000;">
                      LAUNCH PRO VAULT →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color:#0C0C10; padding:28px 32px; border-top:2px solid #FFFFFF; text-align:center;">
              <p style="color:#71717A; font-size:11px; line-height:1.6; margin:0;">
                © ${new Date().getFullYear()} UI-HUB · Official Subscription Confirmation.<br/>
                Questions about your payment or invoice? Reply directly to this email or reach us at <a href="mailto:support@uihub.design" style="color:#3D5CFF; text-decoration:none; font-weight:700;">support@uihub.design</a>.
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

/**
 * Sends a FREE subscription confirmation email via Brevo HTTP API (v3).
 * NO payment receipt is attached to free subscription emails.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} [params.name]
 * @param {string|Date} [params.activatedAt]
 * @returns {Promise<{ success: boolean, messageId?: string, error?: any }>}
 */
export async function sendFreeSubscriptionEmail({ email, name, activatedAt = new Date() }) {
    if (!email) {
        return { success: false, error: 'Recipient email is required' };
    }

    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.BREVO_SMTP_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'UI-HUB';

    if (!apiKey || !senderEmail) {
        return { success: false, error: 'Brevo API credentials missing' };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://uihub.design';
    const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: name || 'there' }],
        replyTo: { email: 'uihub.design@gmail.com', name: 'UI-HUB Support' },
        subject: 'Your FREE UI-HUB Subscription is Active 🎨',
        htmlContent: buildFreeSubscriptionEmailHtml({ name, email, activatedAt }),
        textContent: `Hello ${name || 'there'},\n\nYour FREE UI-HUB Subscription is confirmed and active.\n\nPlan: FREE (Starter)\nEmail: ${email}\nStatus: Active / Unlimited\n\nYou have full access to our starter collection of 50+ open-source React components and foundational vibe prompts.\n\nStart browsing components: ${frontendUrl}/library\n\nNeed help? Contact support at uihub.design@gmail.com\n\n© ${new Date().getFullYear()} UI-HUB · uihub.design`,
    };

    try {
        console.log(`[BrevoService] Sending FREE subscription email to: ${email}...`);
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
        console.log(`[BrevoService] ✅ FREE subscription email sent to ${email} | messageId: ${messageId}`);
        return { success: true, messageId, data: response.data };
    } catch (error) {
        const brevoError = error.response?.data || error.message;
        console.error(`[BrevoService] ❌ Failed to send FREE email to ${email}:`, brevoError);
        return {
            success: false,
            error: typeof brevoError === 'object' ? JSON.stringify(brevoError) : brevoError,
        };
    }
}

/**
 * Sends a PRO subscription confirmation email with attached PDF payment receipt via Brevo HTTP API (v3).
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} [params.name]
 * @param {number|string} params.amount
 * @param {string} [params.currency]
 * @param {string} params.paymentId
 * @param {string} params.orderId
 * @param {string|Date} [params.purchaseDate]
 * @param {string} [params.duration]
 * @param {Buffer} [params.pdfBuffer]
 * @param {string} [params.receiptNumber]
 * @returns {Promise<{ success: boolean, messageId?: string, error?: any }>}
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
    if (!email) {
        return { success: false, error: 'Recipient email is required' };
    }

    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.BREVO_SMTP_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'UI-HUB';

    if (!apiKey || !senderEmail) {
        return { success: false, error: 'Brevo API credentials missing' };
    }

    const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: name || 'there' }],
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
    };

    // Attach PDF payment receipt if available
    if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
        const fileName = `UI-HUB-Receipt-${receiptNumber || paymentId?.slice(-8) || Date.now()}.pdf`;
        payload.attachment = [
            {
                name: fileName,
                content: pdfBuffer.toString('base64'),
            }
        ];
    }

    try {
        console.log(`[BrevoService] Sending PRO subscription email with receipt to: ${email}...`);
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            payload,
            {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                timeout: 20000,
            }
        );

        const messageId = response.data?.messageId || response.data?.messageIds?.[0] || 'sent';
        console.log(`[BrevoService] ✅ PRO subscription email with receipt sent to ${email} | messageId: ${messageId}`);
        return { success: true, messageId, data: response.data };
    } catch (error) {
        const brevoError = error.response?.data || error.message;
        console.error(`[BrevoService] ❌ Failed to send PRO email to ${email}:`, brevoError);
        return {
            success: false,
            error: typeof brevoError === 'object' ? JSON.stringify(brevoError) : brevoError,
        };
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
