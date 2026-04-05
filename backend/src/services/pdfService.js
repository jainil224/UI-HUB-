import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Generates a branded PDF invoice buffer.
 * @param {Object} invoiceData
 * @param {string} invoiceData.customerName
 * @param {string} invoiceData.email
 * @param {string} invoiceData.planName
 * @param {string} invoiceData.planDuration
 * @param {string} invoiceData.billingCycle
 * @param {number} invoiceData.price
 * @param {string} invoiceData.currency
 * @param {string[]} invoiceData.features
 * @param {string} invoiceData.paymentId
 * @param {string} invoiceData.orderId
 * @param {string} invoiceData.invoiceNumber
 * @param {Date}   invoiceData.purchaseDate
 * @returns {Promise<Buffer>} PDF as Buffer
 */
export async function generateInvoicePDF(invoiceData) {
  const html = buildInvoiceHTML(invoiceData);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });

  await browser.close();
  return pdfBuffer;
}

function buildInvoiceHTML(data) {
  const {
    customerName, email, planName, planDuration, billingCycle,
    price, currency, features, paymentId, orderId,
    invoiceNumber, purchaseDate,
  } = data;

  const formattedDate = new Date(purchaseDate).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const expiryDate = new Date(purchaseDate);
  expiryDate.setMonth(expiryDate.getMonth() + (billingCycle === 'Yearly' ? 12 : 6)); // Default Elite 12, Pro 6
  const formattedExpiry = expiryDate.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const gst = Math.round(price * 0.18);
  const subtotal = price - gst;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UI-HUB Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --brand-primary: #0F0F0F;
      --brand-accent:  #00FF1A;   /* UI-HUB Green */
      --brand-accent2: #008A0E;
      --text-primary:  #0F0F0F;
      --text-muted:    #6B7280;
      --border:        #E5E7EB;
      --bg-light:      #F9FAFB;
      --success:       #10B981;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-primary);
      background: #fff;
      font-size: 14px;
      line-height: 1.6;
    }

    /* ── Header Band ── */
    .header {
      background: var(--brand-primary);
      padding: 36px 48px 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .brand-logo {
      font-family: 'Space Mono', monospace;
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }

    .brand-logo span {
      color: var(--brand-accent);
    }

    .invoice-tag {
      text-align: right;
    }

    .invoice-tag h2 {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .invoice-tag p {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      margin-top: 4px;
    }

    /* ── Accent bar ── */
    .accent-bar {
      height: 4px;
      background: linear-gradient(90deg, var(--brand-accent) 0%, var(--brand-accent2) 100%);
    }

    /* ── Main Content ── */
    .content {
      padding: 40px 48px;
    }

    /* ── Meta Grid ── */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 40px;
    }

    .meta-block label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      display: block;
      margin-bottom: 6px;
    }

    .meta-block p {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .meta-block .sub {
      font-size: 12px;
      font-weight: 400;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ── Status Badge ── */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ECFDF5;
      color: var(--success);
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
    }

    /* ── Plan Card ── */
    .plan-card {
      background: var(--bg-light);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 28px 32px;
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
    }

    .plan-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--brand-accent), var(--brand-accent2));
    }

    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .plan-name {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .plan-cycle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .plan-price {
      text-align: right;
    }

    .plan-price .amount {
      font-family: 'Space Mono', monospace;
      font-size: 28px;
      font-weight: 700;
      color: var(--brand-accent2);
    }

    .plan-price .currency {
      font-size: 14px;
      color: var(--text-muted);
      display: block;
      text-align: right;
    }

    .features-list {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .features-list li {
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .features-list li::before {
      content: '✓';
      font-weight: 700;
      color: var(--brand-accent2);
      font-size: 12px;
      flex-shrink: 0;
    }

    /* ── Summary Table ── */
    .summary-section {
      margin-bottom: 32px;
    }

    .summary-section h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }

    .summary-row.total {
      border-bottom: none;
      border-top: 2px solid var(--brand-primary);
      margin-top: 4px;
      padding-top: 14px;
      font-weight: 700;
      font-size: 16px;
    }

    .summary-row .label { color: var(--text-muted); }
    .summary-row .value { font-weight: 600; }
    .summary-row.total .value { color: var(--brand-accent2); font-family: 'Space Mono', monospace; }

    /* ── Transaction IDs ── */
    .txn-section {
      background: var(--brand-primary);
      border-radius: 10px;
      padding: 20px 24px;
      margin-bottom: 32px;
    }

    .txn-section h3 {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 14px;
    }

    .txn-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .txn-row:last-child { margin-bottom: 0; }

    .txn-row .txn-label {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
    }

    .txn-row .txn-value {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: #fff;
      letter-spacing: 0.3px;
    }

    /* ── Validity Banner ── */
    .validity-banner {
      display: flex;
      justify-content: space-between;
      background: linear-gradient(135deg, rgba(0,255,26,0.05) 0%, rgba(0,138,14,0.05) 100%);
      border: 1.5px solid rgba(0,255,26,0.1);
      border-radius: 10px;
      padding: 16px 24px;
      margin-bottom: 32px;
    }

    .validity-item {
      text-align: center;
    }

    .validity-item label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--brand-accent2);
      display: block;
      margin-bottom: 4px;
    }

    .validity-item p {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid var(--border);
      padding: 24px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer p {
      font-size: 11px;
      color: var(--text-muted);
    }

    .footer .brand-footer {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--brand-primary);
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand-logo">UI<span>-</span>HUB</div>
    <div class="invoice-tag">
      <h2>Invoice</h2>
      <p>#${invoiceNumber}</p>
    </div>
  </div>
  <div class="accent-bar"></div>

  <!-- Content -->
  <div class="content">

    <!-- Meta Grid -->
    <div class="meta-grid">
      <div>
        <div class="meta-block">
          <label>Billed To</label>
          <p>${customerName || 'Valued Customer'}</p>
          <p class="sub">${email}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <div class="meta-block">
          <label>Invoice Date</label>
          <p>${formattedDate}</p>
        </div>
        <div class="meta-block" style="margin-top: 16px;">
          <label>Payment Status</label>
          <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
            <div class="status-badge">
              <span class="status-dot"></span>
              Paid
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan Card -->
    <div class="plan-card">
      <div class="plan-header">
        <div>
          <div class="plan-name">${planName}</div>
          <div class="plan-cycle">${billingCycle} Subscription · ${planDuration}</div>
        </div>
        <div class="plan-price">
          <span class="currency">${currency}</span>
          <span class="amount">${currency === 'INR' ? '₹' : '$'}${price}</span>
        </div>
      </div>
      <ul class="features-list">
        ${features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>

    <!-- Validity Banner -->
    <div class="validity-banner">
      <div class="validity-item">
        <label>Plan Starts</label>
        <p>${formattedDate}</p>
      </div>
      <div class="validity-item">
        <label>Duration</label>
        <p>${planDuration}</p>
      </div>
      <div class="validity-item">
        <label>Next Renewal</label>
        <p>${formattedExpiry}</p>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-section">
      <h3>Payment Summary</h3>
      <div class="summary-row">
        <span class="label">Subtotal (excl. GST)</span>
        <span class="value">${currency === 'INR' ? '₹' : '$'}${subtotal.toLocaleString('en-US')}</span>
      </div>
      <div class="summary-row">
        <span class="label">GST (18%)</span>
        <span class="value">${currency === 'INR' ? '₹' : '$'}${gst.toLocaleString('en-US')}</span>
      </div>
      <div class="summary-row total">
        <span class="label">Total Paid</span>
        <span class="value">${currency === 'INR' ? '₹' : '$'}${price.toLocaleString('en-US')}</span>
      </div>
    </div>

    <!-- Transaction IDs -->
    <div class="txn-section">
      <h3>Transaction Reference</h3>
      <div class="txn-row">
        <span class="txn-label">Payment ID</span>
        <span class="txn-value">${paymentId}</span>
      </div>
      <div class="txn-row">
        <span class="txn-label">Order ID</span>
        <span class="txn-value">${orderId}</span>
      </div>
      <div class="txn-row">
        <span class="txn-label">Invoice No.</span>
        <span class="txn-value">${invoiceNumber}</span>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Thank you for choosing UI-HUB · support@uihub.com</p>
    <span class="brand-footer">UI-HUB</span>
  </div>

</body>
</html>
  `;
}
