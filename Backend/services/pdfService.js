const PDFDocument = require('pdfkit');

/**
 * Generates an 80G tax receipt PDF for a donation.
 * @param {Object} donation - Donation document (populated)
 * @param {Object} donor    - User document (donor)
 * @param {Object} ngo      - NGO document
 * @returns {Promise<Buffer>} - PDF as a Buffer (for email + download)
 */
const generateReceiptPDF = (donation, donor, ngo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const GREEN = '#1a6b4a';
      const LIGHT_GREEN = '#2d9e6b';
      const GRAY = '#666666';
      const LIGHT_GRAY = '#f4f4f4';
      const BLACK = '#1a1a1a';

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 60;
      const contentWidth = pageWidth - margin * 2;

      // ── HEADER BACKGROUND ───────────────────────────────────────────
      doc.rect(0, 0, pageWidth, 130).fill(GREEN);

      // ── LOGO / BRAND NAME ────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(30)
        .fillColor('#ffffff')
        .text('🌿 Saahaya', margin, 30, { align: 'left' });

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('rgba(255,255,255,0.85)')
        .text('सहाय — Help • Support • Impact', margin, 65);

      // ── RECEIPT LABEL (right side of header) ─────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#ffffff')
        .text('DONATION RECEIPT', 0, 40, { align: 'right', width: pageWidth - margin });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('rgba(255,255,255,0.85)')
        .text('Section 80G — Income Tax Act', 0, 60, { align: 'right', width: pageWidth - margin });

      // ── RECEIPT NUMBER & DATE ─────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#ffffff')
        .text(donation.taxReceipt.receiptNumber, 0, 80, { align: 'right', width: pageWidth - margin });

      const dateStr = new Date(donation.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('rgba(255,255,255,0.85)')
        .text(dateStr, 0, 97, { align: 'right', width: pageWidth - margin });

      // ── DECORATIVE ACCENT LINE ────────────────────────────────────────
      doc.rect(0, 130, pageWidth, 6).fill(LIGHT_GREEN);

      // ── SECTION: THANK YOU MESSAGE ────────────────────────────────────
      let y = 160;

      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor(GREEN)
        .text('Thank You for Your Generosity!', margin, y, { width: contentWidth, align: 'center' });

      y += 35;
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(GRAY)
        .text(
          `This is to certify that ${donor.name} has made a charitable donation to ${ngo.name} as detailed below. This receipt is issued under Section 80G of the Income Tax Act, 1961.`,
          margin, y,
          { width: contentWidth, align: 'center' }
        );

      // ── DONATION AMOUNT BOX ───────────────────────────────────────────
      y += 55;
      doc.rect(margin, y, contentWidth, 70).fill(LIGHT_GRAY).stroke(LIGHT_GREEN);

      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor(GRAY)
        .text('TOTAL DONATION AMOUNT', margin, y + 12, { width: contentWidth, align: 'center' });

      doc
        .font('Helvetica-Bold')
        .fontSize(32)
        .fillColor(GREEN)
        .text(`₹${donation.amount.toLocaleString('en-IN')}`, margin, y + 30, { width: contentWidth, align: 'center' });

      // ── DETAILS TABLE ─────────────────────────────────────────────────
      y += 95;

      const tableRow = (label, value, rowY, shade = false) => {
        if (shade) doc.rect(margin, rowY, contentWidth, 28).fill('#f9f9f9');
        doc
          .font('Helvetica')
          .fontSize(10.5)
          .fillColor(GRAY)
          .text(label, margin + 12, rowY + 8, { width: contentWidth * 0.42 });
        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(BLACK)
          .text(value, margin + contentWidth * 0.45, rowY + 8, { width: contentWidth * 0.55 });
        doc
          .moveTo(margin, rowY + 28)
          .lineTo(margin + contentWidth, rowY + 28)
          .strokeColor('#eeeeee')
          .lineWidth(1)
          .stroke();
        return rowY + 28;
      };

      // Table header
      doc.rect(margin, y, contentWidth, 30).fill(GREEN);
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#ffffff')
        .text('DONATION DETAILS', margin + 12, y + 9, { width: contentWidth });
      y += 30;

      y = tableRow('Donor Name', donor.name, y, false);
      y = tableRow('Donor Email', donor.email, y, true);
      y = tableRow('Donor Phone', donor.phone || 'N/A', y, false);
      y = tableRow('NGO Name', ngo.name, y, true);
      y = tableRow('Cause', ngo.cause.charAt(0).toUpperCase() + ngo.cause.slice(1), y, false);
      y = tableRow('Donation Amount', `₹${donation.amount.toLocaleString('en-IN')}`, y, true);
      y = tableRow('Tax Saving (50% of donation)', `₹${Math.round(donation.amount * 0.5).toLocaleString('en-IN')}`, y, false);
      y = tableRow('Payment ID', donation.paymentDetails.paymentId || 'N/A', y, true);
      y = tableRow('Receipt Number', donation.taxReceipt.receiptNumber, y, false);
      y = tableRow('Date of Donation', dateStr, y, true);

      // ── 80G CERTIFICATE SECTION ───────────────────────────────────────
      y += 24;
      doc.rect(margin, y, contentWidth, 55).fill('#e8f5ee').stroke(LIGHT_GREEN);

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(GREEN)
        .text('Section 80G — Tax Deduction Certificate', margin + 14, y + 10);

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(GRAY)
        .text(
          `This donation of ₹${donation.amount.toLocaleString('en-IN')} is eligible for 50% tax deduction under Section 80G of the Income Tax Act, 1961. Estimated tax saving: ₹${Math.round(donation.amount * 0.5).toLocaleString('en-IN')}.`,
          margin + 14, y + 27,
          { width: contentWidth - 28 }
        );

      // ── ANONYMOUS NOTE ────────────────────────────────────────────────
      if (donation.isAnonymous) {
        y += 70;
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(GRAY)
          .text('* This donation was made anonymously. The donor identity is kept confidential.', margin, y, { width: contentWidth });
      }

      // ── FOOTER ────────────────────────────────────────────────────────
      const footerY = pageHeight - 80;
      doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).strokeColor('#dddddd').lineWidth(1).stroke();

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(GRAY)
        .text('This is a computer-generated receipt and does not require a physical signature.', margin, footerY + 10, {
          width: contentWidth, align: 'center'
        });
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(GREEN)
        .text('Saahaya Platform — saahaya.in | support@saahaya.in', margin, footerY + 28, {
          width: contentWidth, align: 'center'
        });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(GRAY)
        .text('Made with ❤️ for a better India', margin, footerY + 46, {
          width: contentWidth, align: 'center'
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateReceiptPDF };
