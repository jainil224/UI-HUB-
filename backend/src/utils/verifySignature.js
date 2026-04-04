import crypto from 'crypto';

/**
 * Verifies the Razorpay payment signature
 * @param {string} order_id - The Razorpay order ID
 * @param {string} payment_id - The Razorpay payment ID
 * @param {string} signature - The signature returned from Razorpay checkout
 * @param {string} secret - Razorpay key secret
 * @returns {boolean} - Returns true if valid, false otherwise
 */
export const verifyRazorpaySignature = (order_id, payment_id, signature, secret) => {
  try {
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(generated_signature, 'hex');
    const receivedBuffer = Buffer.from(signature, 'hex');

    if (expectedBuffer.length !== receivedBuffer.length) {
      console.error('[SignatureVerification] Buffer length mismatch.');
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (error) {
    console.error('[SignatureVerification] Error:', error.message);
    return false;
  }
};
