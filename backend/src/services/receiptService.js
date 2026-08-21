import PDFDocument from 'pdfkit';

/**
 * Generates an ultra-premium, modern brutalist PDF payment receipt in memory as a Buffer.
 * Fully compatible with standard PDFKit fonts (no UTF-8 encoding corruption).
 *
 * @param {Object} data
 * @param {string} data.receiptNumber
 * @param {string} data.userName
 * @param {string} data.userEmail
 * @param {string} data.planName
 * @param {string} data.duration
 * @param {number|string} data.amount
 * @param {string} data.currency
 * @param {string} data.paymentId
 * @param {string} data.orderId
 * @param {string|Date} data.paymentDate
 * @param {string} [data.status]
 * @returns {Promise<Buffer>}
 */
export async function generatePaymentReceiptPdf({
    receiptNumber,
    userName,
    userEmail,
    planName = 'PRO ACCESS',
    duration = '6 Months',
    amount,
    currency = 'USD',
    paymentId,
    orderId,
    paymentDate = new Date(),
    status = 'PAID'
}) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 0,
                info: {
                    Title: `UI-HUB Receipt - ${receiptNumber || paymentId}`,
                    Author: 'UI-HUB',
                    Subject: 'Official Subscription Payment Receipt',
                }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => reject(err));

            const currencyCode = currency === 'INR' ? 'INR' : 'USD';
            const formattedAmount = `${currencyCode} ${Number(amount || 0).toFixed(2)}`;
            const formattedDate = new Date(paymentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const pageX = 35;
            const pageY = 35;
            const pageWidth = 525;
            const pageHeight = 770;
            const pageRight = pageX + pageWidth;

            // ── Outer Border ──
            doc.rect(pageX, pageY, pageWidth, pageHeight)
               .lineWidth(2)
               .strokeColor('#0A0A0E')
               .stroke();

            // ── Top Header Banner (Dark / Cyberpunk Neon Blue) ──
            const headerHeight = 85;
            doc.rect(pageX, pageY, pageWidth, headerHeight)
               .fillColor('#0A0A0E')
               .fill();

            // Top Electric Blue Accent Strip
            doc.rect(pageX, pageY, pageWidth, 4)
               .fillColor('#3D5CFF')
               .fill();

            // Brand Logo & Title
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('UI-HUB', pageX + 24, pageY + 22, { characterSpacing: 1.5 });

            doc.fontSize(8.5)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('CINEMA-GRADE UI & MASTER AI PROMPTS', pageX + 24, pageY + 52, { characterSpacing: 1.2 });

            // "OFFICIAL RECEIPT" Badge on Right
            const badgeW = 140;
            const badgeH = 26;
            const badgeX = pageRight - badgeW - 24;
            const badgeY = pageY + 22;

            doc.rect(badgeX, badgeY, badgeW, badgeH)
               .fillColor('#1A1A26')
               .lineWidth(1)
               .strokeColor('#3D5CFF')
               .fillAndStroke();

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('OFFICIAL RECEIPT', badgeX, badgeY + 8, { width: badgeW, align: 'center', characterSpacing: 1 });

            const displayReceiptNo = receiptNumber || `UIHUB-${paymentId?.slice(-8).toUpperCase() || 'RECEIPT'}`;
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#A1A1B2')
               .text(`NO: ${displayReceiptNo}`, badgeX, pageY + 54, { width: badgeW, align: 'right' });

            // ── Confirmation & Status Bar ──
            const statusY = pageY + headerHeight + 16;
            const statusH = 42;

            doc.rect(pageX + 20, statusY, pageWidth - 40, statusH)
               .fillColor('#F4F6FB')
               .lineWidth(1.5)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            // Status Pill (Neon Green with vector dot)
            const pillW = 75;
            const pillH = 22;
            const pillX = pageX + 32;
            const pillY = statusY + 10;

            doc.rect(pillX, pillY, pillW, pillH)
               .fillColor('#00FF1A')
               .lineWidth(1.5)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            // Draw crisp vector circle dot inside pill
            doc.circle(pillX + 16, pillY + 11, 3.5)
               .fillColor('#000000')
               .fill();

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(status.toUpperCase(), pillX + 26, pillY + 6);

            doc.fontSize(11.5)
               .font('Helvetica-Bold')
               .fillColor('#0A0A0E')
               .text(`Payment Confirmed — Total: ${formattedAmount}`, pillX + pillW + 16, statusY + 14);

            // ── Metadata Grid (Billed To + Transaction Details) ──
            const metaY = statusY + statusH + 16;
            const metaCardW = (pageWidth - 40 - 14) / 2;
            const metaCardH = 105;

            // Card 1: Billed To
            doc.rect(pageX + 20, metaY, metaCardW, metaCardH)
               .fillColor('#FFFFFF')
               .lineWidth(1.5)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('// BILLED TO', pageX + 32, metaY + 12);

            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#0A0A0E')
               .text(userName || 'Valued Creator', pageX + 32, metaY + 28);

            doc.fontSize(8.5)
               .font('Helvetica')
               .fillColor('#555566')
               .text(userEmail || 'N/A', pageX + 32, metaY + 45)
               .text('Account: Verified Member', pageX + 32, metaY + 60)
               .text('Tier: PRO ACCESS', pageX + 32, metaY + 75);

            // Card 2: Transaction Details
            const card2X = pageX + 20 + metaCardW + 14;
            doc.rect(card2X, metaY, metaCardW, metaCardH)
               .fillColor('#FFFFFF')
               .lineWidth(1.5)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('// TRANSACTION SUMMARY', card2X + 12, metaY + 12);

            const labelX = card2X + 12;
            const valX = card2X + 78;

            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0A0A0E');
            doc.text('Date:', labelX, metaY + 28);
            doc.text('Payment ID:', labelX, metaY + 44);
            doc.text('Order ID:', labelX, metaY + 60);
            doc.text('Gateway:', labelX, metaY + 76);

            doc.font('Helvetica').fillColor('#333344');
            doc.text(formattedDate, valX, metaY + 28);
            doc.text(paymentId || 'N/A', valX, metaY + 44);
            doc.text(orderId || 'N/A', valX, metaY + 60);
            doc.text('Razorpay Secured', valX, metaY + 76);

            // ── Line Items Table ──
            const tableY = metaY + metaCardH + 16;
            const tableW = pageWidth - 40;
            const thH = 26;

            // Table Header Bar
            doc.rect(pageX + 20, tableY, tableW, thH)
               .fillColor('#0A0A0E')
               .fill();

            doc.fontSize(8.5)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('PLAN DESCRIPTION', pageX + 32, tableY + 8)
               .text('DURATION', pageX + 245, tableY + 8)
               .text('RATE', pageX + 335, tableY + 8)
               .text('AMOUNT', pageRight - 100, tableY + 8, { width: 80, align: 'right' });

            // Table Content Row
            const rowY = tableY + thH;
            const rowH = 56;

            doc.rect(pageX + 20, rowY, tableW, rowH)
               .fillColor('#FFFFFF')
               .lineWidth(1.2)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            doc.fontSize(10.5)
               .font('Helvetica-Bold')
               .fillColor('#0A0A0E')
               .text(planName.toUpperCase(), pageX + 32, rowY + 12);

            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#666677')
               .text('Full access to 100+ components, AI Vibe Prompts, and 3D Blueprints', pageX + 32, rowY + 28, { width: 200 });

            doc.fontSize(9.5)
               .font('Helvetica-Bold')
               .fillColor('#0A0A0E')
               .text(duration, pageX + 245, rowY + 18)
               .text(formattedAmount, pageX + 335, rowY + 18)
               .text(formattedAmount, pageRight - 100, rowY + 18, { width: 80, align: 'right' });

            // ── Bottom Summary & Benefits Grid ──
            const botY = rowY + rowH + 16;
            const sumW = 210;
            const sumX = pageRight - 20 - sumW;
            const botCardH = 110;

            // Summary Card (Right)
            doc.rect(sumX, botY, sumW, botCardH)
               .fillColor('#F4F6FB')
               .lineWidth(1.5)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            doc.fontSize(8.5)
               .font('Helvetica')
               .fillColor('#555566')
               .text('Subtotal:', sumX + 14, botY + 14)
               .text('Taxes & Fees:', sumX + 14, botY + 34);

            doc.fontSize(8.5)
               .font('Helvetica-Bold')
               .fillColor('#0A0A0E')
               .text(formattedAmount, sumX + 90, botY + 14, { width: sumW - 104, align: 'right' })
               .text('Included (0.00)', sumX + 90, botY + 34, { width: sumW - 104, align: 'right' });

            // Divider line
            doc.moveTo(sumX + 14, botY + 54)
               .lineTo(sumX + sumW - 14, botY + 54)
               .lineWidth(1)
               .strokeColor('#D0D0DC')
               .stroke();

            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('Total Paid:', sumX + 14, botY + 72);

            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#0A0A0E')
               .text(formattedAmount, sumX + 90, botY + 72, { width: sumW - 104, align: 'right' });

            // Benefits Card (Left)
            const benW = tableW - sumW - 14;
            doc.rect(pageX + 20, botY, benW, botCardH)
               .fillColor('#FFFFFF')
               .lineWidth(1.2)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('// PRO MEMBERSHIP PRIVILEGES ACTIVATED', pageX + 32, botY + 12);

            const benefits = [
                'Unlimited ZIP component & blueprint downloads',
                'Master AI Vibe Prompts (Antigravity + Claude + Cursor)',
                'Cinema-grade 3D components & visual effects',
                'Lifetime priority updates & premium templates'
            ];

            let bY = botY + 28;
            benefits.forEach(b => {
                // Draw a small blue square bullet
                doc.rect(pageX + 32, bY + 1, 5, 5)
                   .fillColor('#3D5CFF')
                   .fill();

                doc.fontSize(7.8)
                   .font('Helvetica')
                   .fillColor('#222233')
                   .text(b, pageX + 42, bY);
                bY += 18;
            });

            // ── Footer Banner ──
            const footerY = pageY + pageHeight - 90;
            const footerH = 70;

            doc.rect(pageX + 20, footerY, tableW, footerH)
               .fillColor('#0A0A0E')
               .lineWidth(1.5)
               .strokeColor('#0A0A0E')
               .fillAndStroke();

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('THANK YOU FOR BEING PART OF UI-HUB!', pageX + 32, footerY + 12);

            doc.fontSize(7.5)
               .font('Helvetica')
               .fillColor('#9EA3B0')
               .text('This is an electronically generated official receipt for your subscription payment on UI-HUB.', pageX + 32, footerY + 27)
               .text('Need help or custom billing details? Reach us anytime at support@uihub.design', pageX + 32, footerY + 39)
               .text('Website: https://uihub.design   |   GitHub: https://github.com/jainil224/UI-HUB-', pageX + 32, footerY + 51);

            // Watermark text on right
            doc.fontSize(7.5)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('UI-HUB // SYSTEM_VERIFIED', pageRight - 180, footerY + 51, { width: 148, align: 'right' });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}
