import nodemailer from 'nodemailer';
// PDF Service removed entirely to fix Vercel crash
import { PLANS } from '../config/plans.js';

// FIX 2: Startup credential check — must appear in Render logs on boot
const smtpUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
const smtpPass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;
console.log('[EmailService] SMTP User loaded:', !!(smtpUser));
if (!smtpUser || !smtpPass) {
  console.error('[EmailService] ⚠️  BREVO_SMTP_USER or BREVO_SMTP_PASS is NOT set — invoice emails will fail!');
}

// FIX 2: Use BREVO_ prefixed vars with fallback to generic SMTP_ vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.BREVO_SMTP_USER || process.env.SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS,
  },
  // Hardening for Render
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 30000,
  tls: {
    minVersion: 'TLSv1.2',
    servername: 'smtp-relay.brevo.com', // FIX 4: removed rejectUnauthorized: false
  }
});

/**
 * Sends a branded invoice email after successful payment.
 * PDF attachment is disabled due to Vercel serverless size limits.
 */
export async function sendInvoiceEmail({ email, displayName, planId, paymentId, orderId, purchaseDate }) {
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Unknown planId: ${planId}`);

  // Generate a deterministic invoice number from payment ID
  const invoiceNumber = `UIHUB-${new Date(purchaseDate).getFullYear()}-${paymentId.slice(-8).toUpperCase()}`;

  const params = {
    customerName:  displayName || '',
    email,
    planName:      plan.name,
    planDuration:  plan.duration,
    billingCycle:  plan.billingCycle,
    price:         plan.price || 0,
    currency:      plan.currency || 'USD',
    features:      plan.features,
    paymentId,
    orderId,
    invoiceNumber,
    purchaseDate:  purchaseDate || new Date(),
  };

  // FIX 2: Use BREVO_ prefixed vars for the from address
  const fromAddress = process.env.SMTP_FROM || process.env.BREVO_SMTP_USER || process.env.SMTP_USER || 'support@uihub.design';

  const info = await transporter.sendMail({
    from: `"UI HUB Support" <${fromAddress}>`,
    to: email,
    subject: `Your UI-HUB ${plan.name} Invoice — ${invoiceNumber}`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0F0F0F;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Welcome to UI-HUB ${plan.name}! 🎉</h1>
        <p style="color: #6B7280; margin-bottom: 24px;">Your payment was successful. Your plan is now active.</p>

        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p><strong>Invoice No:</strong> <code style="font-family: monospace; background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${invoiceNumber}</code></p>
          <p><strong>Plan:</strong> ${plan.name}</p>
          <p><strong>Duration:</strong> ${plan.duration}</p>
          <p><strong>Amount:</strong> ${params.currency} ${params.price}</p>
          <p><strong>Payment ID:</strong> <code style="font-family: monospace; background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${paymentId}</code></p>
          <p><strong>Order ID:</strong> <code style="font-family: monospace; background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${orderId}</code></p>
          <p><strong>Date:</strong> ${new Date(purchaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- FIX 1: Replaced the lying "PDF is attached" sentence with honest copy -->
        <p style="color: #6B7280; font-size: 13px;">Your invoice summary is shown above. Please save this email for your records.<br/>A downloadable PDF invoice will be available in your dashboard.</p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9CA3AF;">UI-HUB · support@uihub.design</p>
      </div>
    `,
    // No attachments — PDF generation disabled due to Vercel/Chromium constraints
  });

  console.log(`[EmailService] ✅ Invoice sent to ${email} — ${invoiceNumber} | messageId: ${info.messageId}`);
  return { success: true, invoiceNumber, messageId: info.messageId };
}
