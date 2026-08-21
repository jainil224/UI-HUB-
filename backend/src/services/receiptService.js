import PDFDocument from 'pdfkit';

/**
 * Generates a high-quality, professional PDF payment receipt in memory as a Buffer.
 * Designed with UI-HUB's modern brutalist aesthetic (crisp lines, bold accents, clear data hierarchy).
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
                margin: 40,
                info: {
                    Title: `UI-HUB Receipt - ${receiptNumber || paymentId}`,
                    Author: 'UI-HUB',
                    Subject: 'Subscription Payment Receipt',
                }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => reject(err));

            const currencySymbol = currency === 'INR' ? 'INR ' : '$';
            const formattedAmount = `${currencySymbol}${Number(amount || 0).toFixed(2)}`;
            const formattedDate = new Date(paymentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const pageLeft = 40;
            const pageWidth = 515;
            const pageRight = pageLeft + pageWidth;

            // ── Background & Outer Container ──
            // Outer Brutalist Border Box
            doc.rect(pageLeft, 40, pageWidth, 740)
               .lineWidth(2)
               .strokeColor('#000000')
               .stroke();

            // ── Top Header Banner (Dark / Cyberpunk Neon Blue) ──
            doc.rect(pageLeft, 40, pageWidth, 90)
               .fillColor('#0F0F14')
               .fill();

            // Top decorative accent line (Electric Blue)
            doc.rect(pageLeft, 40, pageWidth, 4)
               .fillColor('#3D5CFF')
               .fill();

            // Logo & Brand Name
            doc.fontSize(22)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('UI-HUB', pageLeft + 24, 60, { characterSpacing: 1 });

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('CINEMA-GRADE UI & AI PROMPTS', pageLeft + 24, 86, { characterSpacing: 1.5 });

            // "PAYMENT RECEIPT" Badge on Right
            doc.rect(pageRight - 160, 60, 136, 26)
               .fillColor('#1E1E28')
               .lineWidth(1)
               .strokeColor('#3D5CFF')
               .fillAndStroke();

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('OFFICIAL RECEIPT', pageRight - 160, 68, { width: 136, align: 'center', characterSpacing: 1 });

            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#A0A0B0')
               .text(`NO: ${receiptNumber || `UIHUB-${paymentId?.slice(-8).toUpperCase() || 'RECEIPT'}`}`, pageRight - 160, 95, { width: 136, align: 'right' });

            // ── Sub-header Bar / Status Indicator ──
            const subY = 145;
            doc.rect(pageLeft + 24, subY, pageWidth - 48, 48)
               .fillColor('#F4F6FB')
               .lineWidth(1.5)
               .strokeColor('#000000')
               .fillAndStroke();

            // Status Pill (Green)
            doc.rect(pageLeft + 40, subY + 12, 80, 24)
               .fillColor('#00FF1A')
               .lineWidth(1.5)
               .strokeColor('#000000')
               .fillAndStroke();

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(`● ${status.toUpperCase()}`, pageLeft + 40, subY + 19, { width: 80, align: 'center' });

            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(`Payment Confirmed — Total: ${formattedAmount}`, pageLeft + 135, subY + 18);

            // ── Customer & Transaction Meta Grid ──
            const gridY = 215;

            // Box 1: Billed To
            doc.rect(pageLeft + 24, gridY, (pageWidth - 60) / 2, 110)
               .fillColor('#FFFFFF')
               .lineWidth(1.5)
               .strokeColor('#000000')
               .fillAndStroke();

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('// BILLED TO', pageLeft + 36, gridY + 14);

            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(userName || 'Valued Creator', pageLeft + 36, gridY + 30);

            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#555566')
               .text(userEmail || 'N/A', pageLeft + 36, gridY + 48)
               .text('Customer Account Verified', pageLeft + 36, gridY + 64);

            // Box 2: Payment Details
            const box2X = pageLeft + 24 + (pageWidth - 60) / 2 + 12;
            doc.rect(box2X, gridY, (pageWidth - 60) / 2, 110)
               .fillColor('#FFFFFF')
               .lineWidth(1.5)
               .strokeColor('#000000')
               .fillAndStroke();

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('// TRANSACTION SUMMARY', box2X + 12, gridY + 14);

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text('Date:', box2X + 12, gridY + 32)
               .text('Payment ID:', box2X + 12, gridY + 48)
               .text('Order ID:', box2X + 12, gridY + 64)
               .text('Gateway:', box2X + 12, gridY + 80);

            doc.font('Helvetica')
               .fillColor('#333333')
               .text(formattedDate, box2X + 80, gridY + 32)
               .text(paymentId || 'N/A', box2X + 80, gridY + 48)
               .text(orderId || 'N/A', box2X + 80, gridY + 64)
               .text('Razorpay Secured', box2X + 80, gridY + 80);

            // ── Itemized Table ──
            const tableY = 345;
            
            // Table Header
            doc.rect(pageLeft + 24, tableY, pageWidth - 48, 28)
               .fillColor('#0F0F14')
               .fill();

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('PLAN DESCRIPTION', pageLeft + 36, tableY + 9)
               .text('PERIOD', pageLeft + 260, tableY + 9)
               .text('PRICE', pageLeft + 360, tableY + 9)
               .text('AMOUNT', pageRight - 90, tableY + 9, { width: 54, align: 'right' });

            // Table Row
            const rowY = tableY + 28;
            doc.rect(pageLeft + 24, rowY, pageWidth - 48, 64)
               .fillColor('#FFFFFF')
               .lineWidth(1)
               .strokeColor('#000000')
               .fillAndStroke();

            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(planName.toUpperCase(), pageLeft + 36, rowY + 14);

            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#666677')
               .text('Full access to 100+ components, AI Vibe Prompts, and 3D Assets', pageLeft + 36, rowY + 32, { width: 210 });

            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(duration, pageLeft + 260, rowY + 20)
               .text(formattedAmount, pageLeft + 360, rowY + 20)
               .text(formattedAmount, pageRight - 90, rowY + 20, { width: 54, align: 'right' });

            // ── Summary Box ──
            const sumY = rowY + 76;
            const sumWidth = 230;
            const sumX = pageRight - 24 - sumWidth;

            doc.rect(sumX, sumY, sumWidth, 100)
               .fillColor('#F4F6FB')
               .lineWidth(1.5)
               .strokeColor('#000000')
               .fillAndStroke();

            doc.fontSize(9)
               .font('Helvetica')
               .fillColor('#555566')
               .text('Subtotal:', sumX + 16, sumY + 14)
               .text('Taxes & Fees:', sumX + 16, sumY + 34);

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(formattedAmount, sumX + 100, sumY + 14, { width: sumWidth - 116, align: 'right' })
               .text('Included ($0.00)', sumX + 100, sumY + 34, { width: sumWidth - 116, align: 'right' });

            doc.moveTo(sumX + 16, sumY + 54)
               .lineTo(sumX + sumWidth - 16, sumY + 54)
               .lineWidth(1)
               .strokeColor('#CCCCCC')
               .stroke();

            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('Total Paid:', sumX + 16, sumY + 68);

            doc.fontSize(13)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(formattedAmount, sumX + 100, sumY + 68, { width: sumWidth - 116, align: 'right' });

            // ── Left Benefits / Inclusions Box ──
            const benWidth = pageWidth - 48 - sumWidth - 16;
            doc.rect(pageLeft + 24, sumY, benWidth, 100)
               .fillColor('#FFFFFF')
               .lineWidth(1)
               .strokeColor('#000000')
               .fillAndStroke();

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('// PRO MEMBERSHIP PRIVILEGES ACTIVATED', pageLeft + 36, sumY + 14);

            const benefits = [
                '✓ Unlimited ZIP code & blueprint downloads',
                '✓ Access to Antigravity + Claude + Cursor prompts',
                '✓ Cinema-grade 3D components & visual effects',
                '✓ Priority support & continuous component updates'
            ];

            let bY = sumY + 30;
            benefits.forEach(b => {
                doc.fontSize(7.5)
                   .font('Helvetica')
                   .fillColor('#333344')
                   .text(b, pageLeft + 36, bY);
                bY += 15;
            });

            // ── Footer & Security Guarantee ──
            const footerY = 660;

            doc.rect(pageLeft + 24, footerY, pageWidth - 48, 90)
               .fillColor('#0F0F14')
               .lineWidth(1.5)
               .strokeColor('#000000')
               .fillAndStroke();

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('THANK YOU FOR BEING PART OF UI-HUB!', pageLeft + 36, footerY + 16);

            doc.fontSize(7.5)
               .font('Helvetica')
               .fillColor('#A0A0B5')
               .text('This is an electronically generated official receipt for your subscription payment on UI-HUB.', pageLeft + 36, footerY + 32)
               .text('Need help, custom invoice details, or support? Reach us anytime at support@uihub.design', pageLeft + 36, footerY + 45)
               .text('Website: https://uihub.design  •  GitHub: https://github.com/jainil224/UI-HUB-', pageLeft + 36, footerY + 58);

            // Bottom Brand Mark
            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#3D5CFF')
               .text('UI-HUB // SYSTEM_VERIFIED', pageRight - 180, footerY + 68, { width: 144, align: 'right' });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}
