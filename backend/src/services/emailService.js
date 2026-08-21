import { sendProSubscriptionEmail } from '../utils/sendEmail.js';
import { PLANS } from '../config/plans.js';

/**
 * Sends a branded PRO invoice/receipt email after successful payment.
 * Automatically generates and attaches the PDF receipt.
 */
export async function sendInvoiceEmail({ email, displayName, planId, paymentId, orderId, purchaseDate, amount, currency }) {
  const plan = PLANS[planId] || { name: 'PRO ACCESS', duration: '6 Months' };

  return await sendProSubscriptionEmail({
    email,
    name: displayName,
    amount: amount || (currency === 'INR' ? 99 : 4.99),
    currency: currency || 'USD',
    paymentId,
    orderId,
    purchaseDate: purchaseDate || new Date(),
    duration: plan.duration || '6 Months',
  });
}

export default {
  sendInvoiceEmail,
};
