import nodemailer from 'nodemailer';
import { generateInvoicePDF } from './pdfService.js';
import { PLANS } from '../config/plans.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a branded invoice email with PDF attachment after successful payment.
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
    price:         plan.price || 0, // Fallback if dynamically setting
    currency:      plan.currency || 'USD',
    features:      plan.features,
    paymentId,
    orderId,
    invoiceNumber,
    purchaseDate:  purchaseDate || new Date(),
  };

  const pdfBuffer = await generateInvoicePDF(params);

  await transporter.sendMail({
    from: `"UI HUB Support" <${process.env.SMTP_FROM || 'support@ui-hub.com'}>`,
    to: email,
    subject: `Your UI-HUB ${plan.name} Invoice — ${invoiceNumber}`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0F0F0F;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Welcome to UI-HUB ${plan.name}! 🎉</h1>
        <p style="color: #6B7280; margin-bottom: 24px;">Your payment was successful. Your plan is now active.</p>

        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p><strong>Plan:</strong> ${plan.name}</p>
          <p><strong>Duration:</strong> ${plan.duration}</p>
          <p><strong>Payment ID:</strong> <code style="font-family: monospace; background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${paymentId}</code></p>
        </div>

        <p style="color: #6B7280; font-size: 13px;">Your detailed invoice is attached as a PDF. Keep it for your records.</p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9CA3AF;">UI-HUB · support@ui-hub.com</p>
      </div>
    `,
    attachments: [
      {
        filename: `UI-HUB-Invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  console.log(`[EMAIL] Invoice sent to ${email} — ${invoiceNumber}`);
  return invoiceNumber;
}
