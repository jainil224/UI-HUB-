import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildPaymentReceiptHtml = (paymentDetails) => {
  const { payment_id, order_id, amount, date, user_email } = paymentDetails;
  
  // Format amount to fixed 2 decimal places
  const formattedAmount = Number(amount).toFixed(2);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - UI HUB</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0d0d0d;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          backdrop-filter: blur(10px);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #00FF1A, #008A0E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          color: #e0e0e0;
          font-weight: 600;
          margin: 0;
        }
        .amount-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: rgba(0, 255, 26, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(0, 255, 26, 0.1);
        }
        .amount {
          font-size: 42px;
          font-weight: 800;
          color: #00FF1A;
          margin: 0;
        }
        .amount-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 5px;
        }
        .details {
          margin-top: 30px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 25px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 15px;
        }
        .detail-row:last-child {
          margin-bottom: 0;
          border-bottom: none;
          padding-bottom: 0;
        }
        .detail-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }
        .detail-value {
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          text-align: right;
        }
        .status {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(0, 255, 26, 0.15);
          color: #00FF1A;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }
        .message {
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">UI HUB</div>
          <h1 class="title">Payment Receipt</h1>
        </div>
        
        <div class="message">
          Hi there,<br/>
          Thank you for upgrading to Premium. Your payment was successful and your account has been upgraded.
        </div>

        <div class="amount-container">
          <h2 class="amount">${formattedAmount}</h2>
          <div class="amount-label">Amount Paid</div>
        </div>

        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="status">SUCCESS</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Transaction ID</span>
            <span class="detail-value">${payment_id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order ID</span>
            <span class="detail-value">${order_id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">${user_email}</span>
          </div>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} UI HUB. All rights reserved.<br/>
          This is an automated message, please do not reply.
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendPaymentReceipt = async (paymentDetails) => {
  try {
    const transporter = createTransporter();
    
    // Check if SMTP configuration is valid
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing. Mocking email receipt.');
      console.log('Mock email Receipt content:', paymentDetails);
      return true;
    }

    const mailOptions = {
      from: '"UI HUB Support" <support@ui-hub.com>',
      to: paymentDetails.user_email,
      subject: 'Payment Receipt - UI HUB Premium',
      html: buildPaymentReceiptHtml(paymentDetails)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment receipt sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    // Don't throw, we don't want to fail the entire payment verified hook just because email failed.
    return false;
  }
};
