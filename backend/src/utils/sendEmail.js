import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {
    sendWelcomeEmail as sendWelcomeEmailViaBrevoApi,
    sendFreeSubscriptionEmail as sendFreeSubscriptionEmailViaBrevoApi,
    sendProSubscriptionEmail as sendProSubscriptionEmailViaBrevoApi,
    buildWelcomeEmailHtml,
    buildFreeSubscriptionEmailHtml,
    buildProSubscriptionEmailHtml,
} from '../services/brevoService.js';
import { generatePaymentReceiptPdf } from '../services/receiptService.js';

dotenv.config();

let cachedTransporter = null;
let cachedFromAddress = null;

function getTransporter() {
  if (cachedTransporter) {
    return { transporter: cachedTransporter, fromAddress: cachedFromAddress };
  }

  const user   = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
  const pass   = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;
  const host   = process.env.SMTP_HOST   || 'smtp-relay.brevo.com';
  const port   = parseInt(process.env.SMTP_PORT || '587');

  const secure = port === 465 || process.env.SMTP_SECURE === 'true';

  if (!user || !pass) {
    throw new Error(
      '[EmailService] BREVO_SMTP_USER (or SMTP_USER) / BREVO_SMTP_PASS (or SMTP_PASS) is not set in environment variables.'
    );
  }

  cachedFromAddress = process.env.SMTP_FROM || user;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: { user, pass },
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
 * Sends the UI-HUB branded welcome email via Brevo HTTP API with SMTP fallback.
 * Idempotency is guarded by the Firestore `welcomeEmailSent` flag in userRoutes.js.
 */
export async function sendWelcomeEmail(email, name) {
  // 1. Primary method: Brevo HTTP Transactional Email API
  const result = await sendWelcomeEmailViaBrevoApi(email, name);
  if (result.success) {
    return result;
  }

  // 2. Fallback to SMTP if Brevo API is not configured or failed
  console.warn('[EmailService] Brevo HTTP API welcome send unfulfilled, attempting SMTP fallback...');
  try {
    const { transporter, fromAddress } = getTransporter();
    const displayName = name || 'there';
    const mailOptions = {
      from:    `"UI-HUB" <${fromAddress}>`,
      to:      email,
      replyTo: 'uihub.design@gmail.com',
      subject: 'Welcome to UI-HUB — Your components are ready 🎨',
      html:    buildWelcomeEmailHtml(displayName),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✅ Welcome email sent to ${email} via SMTP fallback — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] ❌ SMTP fallback also failed:`, err.message);
    return result;
  }
}

/**
 * Sends the UI-HUB FREE subscription confirmation email via Brevo HTTP API with SMTP fallback.
 * NO payment receipt is attached to free emails.
 * Idempotency is guarded by the Firestore `freeSubscriptionEmailSent` flag.
 */
export async function sendFreeSubscriptionEmail({ email, name, activatedAt = new Date() }) {
  // 1. Primary method: Brevo HTTP API
  const result = await sendFreeSubscriptionEmailViaBrevoApi({ email, name, activatedAt });
  if (result.success) {
    return result;
  }

  // 2. Fallback to SMTP
  console.warn('[EmailService] Brevo HTTP API free subscription send unfulfilled, attempting SMTP fallback...');
  try {
    const { transporter, fromAddress } = getTransporter();
    const mailOptions = {
      from:    `"UI-HUB" <${fromAddress}>`,
      to:      email,
      replyTo: 'uihub.design@gmail.com',
      subject: 'Your FREE UI-HUB Subscription is Active 🎨',
      html:    buildFreeSubscriptionEmailHtml({ name, email, activatedAt }),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✅ FREE subscription email sent to ${email} via SMTP fallback — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] ❌ SMTP fallback for FREE subscription failed:`, err.message);
    return result;
  }
}

/**
 * Sends the UI-HUB PRO subscription confirmation email with attached PDF receipt.
 * Verified payment only.
 * Idempotency is guarded by the Firestore `proSubscriptionEmailSent` / `invoiceEmailSent` flag.
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
}) {
  const receiptNumber = `UIHUB-${new Date(purchaseDate).getFullYear()}-${(paymentId || '').slice(-8).toUpperCase() || 'RECEIPT'}`;
  
  // 1. Generate the PDF payment receipt Buffer
  let pdfBuffer = null;
  try {
    pdfBuffer = await generatePaymentReceiptPdf({
      receiptNumber,
      userName: name,
      userEmail: email,
      planName: 'PRO ACCESS',
      duration,
      amount,
      currency,
      paymentId,
      orderId,
      paymentDate: purchaseDate,
      status: 'PAID',
    });
    console.log(`[EmailService] ✅ PDF receipt generated (${pdfBuffer?.length} bytes) for payment: ${paymentId}`);
  } catch (pdfErr) {
    console.error('[EmailService] ⚠️ PDF receipt generation failed:', pdfErr.message);
  }

  // 2. Primary method: Brevo HTTP API with PDF attachment
  const result = await sendProSubscriptionEmailViaBrevoApi({
    email,
    name,
    amount,
    currency,
    paymentId,
    orderId,
    purchaseDate,
    duration,
    pdfBuffer,
    receiptNumber,
  });

  if (result.success) {
    return { ...result, receiptNumber };
  }

  // 3. Fallback to SMTP with attachment
  console.warn('[EmailService] Brevo HTTP API pro subscription send unfulfilled, attempting SMTP fallback...');
  try {
    const { transporter, fromAddress } = getTransporter();
    const mailOptions = {
      from:    `"UI-HUB Pro" <${fromAddress}>`,
      to:      email,
      replyTo: 'support@uihub.design',
      subject: 'Welcome to PRO ACCESS — Payment Confirmed & Receipt Attached 🚀',
      html:    buildProSubscriptionEmailHtml({
        name,
        email,
        amount,
        currency,
        paymentId,
        orderId,
        purchaseDate,
        duration,
      }),
      attachments: pdfBuffer ? [
        {
          filename: `UI-HUB-Receipt-${receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }
      ] : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✅ PRO subscription email sent to ${email} via SMTP fallback — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, receiptNumber };
  } catch (err) {
    console.error(`[EmailService] ❌ SMTP fallback for PRO subscription failed:`, err.message);
    return { ...result, receiptNumber };
  }
}

export default {
  sendWelcomeEmail,
  sendFreeSubscriptionEmail,
  sendProSubscriptionEmail,
};
