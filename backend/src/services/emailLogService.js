import { mongoService } from './mongoService.js';

const EMAIL_LOGS_COLLECTION = 'email_logs';

/**
 * Log an email event to MongoDB `email_logs`.
 * Non-blocking: logs asynchronously so email delivery is never delayed.
 *
 * @param {object} params
 * @param {string} params.recipientEmail
 * @param {string} [params.recipientName]
 * @param {string} params.templateType     e.g. 'welcome', 'pro_subscription', 'free_subscription'
 * @param {string} params.subject
 * @param {string} [params.status='sent']  'sent' | 'failed' | 'bounced'
 * @param {string} [params.messageId]      ID returned by Brevo
 * @param {boolean} [params.hasAttachment=false]
 * @param {string|object} [params.error]
 * @param {object} [params.metadata]
 */
export async function logEmailEvent({
  recipientEmail,
  recipientName = '',
  templateType,
  subject,
  status = 'sent',
  messageId = '',
  hasAttachment = false,
  error = null,
  metadata = {},
}) {
  if (!recipientEmail) return;

  try {
    const col = await mongoService.getCollection(EMAIL_LOGS_COLLECTION);
    await col.insertOne({
      recipientEmail: recipientEmail.toLowerCase(),
      recipientName,
      templateType,
      subject,
      provider: 'brevo',
      status,
      messageId: messageId ? String(messageId) : null,
      hasAttachment: Boolean(hasAttachment),
      error: error ? (typeof error === 'object' ? JSON.stringify(error) : String(error)) : null,
      metadata,
      sentAt: new Date(),
    });
  } catch (err) {
    // Non-fatal error so application flow is never interrupted
    console.error('[EmailLogService] Failed to record email log to MongoDB:', err.message);
  }
}

export const emailLogService = { logEmailEvent };
export default emailLogService;
