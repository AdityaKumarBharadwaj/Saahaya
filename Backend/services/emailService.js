const nodemailer = require('nodemailer');

// ── CREATE TRANSPORTER ───────────────────────────────────────────────────────
const createTransporter = () => {
  // Production: SendGrid SMTP
  if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Development: Gmail with App Password
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// ── SHARED HTML WRAPPER ───────────────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; color: #333; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a6b4a 0%, #2d9e6b 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.85); margin-top: 6px; font-size: 14px; }
    .body { padding: 36px 40px; }
    .body h2 { color: #1a6b4a; font-size: 22px; margin-bottom: 16px; }
    .body p { line-height: 1.7; color: #555; margin-bottom: 14px; font-size: 15px; }
    .highlight-box { background: #f0faf5; border-left: 4px solid #2d9e6b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight-box p { margin: 0; color: #1a6b4a; font-weight: 500; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
    .info-table td:first-child { color: #888; width: 40%; }
    .info-table td:last-child { color: #333; font-weight: 600; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1a6b4a, #2d9e6b); color: #fff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 8px; }
    .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #aaa; font-size: 12px; line-height: 1.6; }
    .footer strong { color: #1a6b4a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🌿 Saahaya</h1>
      <p>सहाय — Help • Support • Impact</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p><strong>Saahaya</strong> — Connecting donors with verified NGOs across India</p>
      <p style="margin-top:8px">This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

// ── 1. WELCOME EMAIL ─────────────────────────────────────────────────────────
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  const roleLabel = user.role === 'ngo' ? 'NGO Partner' : user.role === 'admin' ? 'Administrator' : 'Donor';

  const content = `
    <h2>Welcome to Saahaya, ${user.name}! 🎉</h2>
    <p>Thank you for joining us. Your account has been created successfully as a <strong>${roleLabel}</strong>.</p>
    <div class="highlight-box">
      <p>Together, we can make a real difference in the lives of millions across India.</p>
    </div>
    <table class="info-table">
      <tr><td>Name</td><td>${user.name}</td></tr>
      <tr><td>Email</td><td>${user.email}</td></tr>
      <tr><td>Role</td><td>${roleLabel}</td></tr>
    </table>
    ${user.role === 'ngo' ? `
    <p>As an NGO partner, your next step is to complete your NGO profile and upload your verification documents so our team can review and approve your organization.</p>
    ` : `
    <p>Start browsing our verified NGOs and make your first donation to a cause you care about.</p>
    `}
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;

  await transporter.sendMail({
    from: `"Saahaya Platform" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Welcome to Saahaya, ${user.name}! 🌿`,
    html: emailWrapper(content)
  });
};

// ── 2. DONATION RECEIPT EMAIL ─────────────────────────────────────────────────
const sendDonationReceiptEmail = async (donor, donation, ngo, pdfBuffer) => {
  const transporter = createTransporter();
  const taxSaving = Math.round(donation.amount * 0.5);
  const dateStr = new Date(donation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const content = `
    <h2>Donation Receipt — Thank You! 🙏</h2>
    <p>Dear <strong>${donor.name}</strong>, your generous donation has been received successfully. Please find your 80G tax receipt attached to this email.</p>
    <div class="highlight-box">
      <p>Receipt No: ${donation.taxReceipt.receiptNumber}</p>
    </div>
    <table class="info-table">
      <tr><td>Donation To</td><td>${ngo.name}</td></tr>
      <tr><td>Cause</td><td>${ngo.cause.charAt(0).toUpperCase() + ngo.cause.slice(1)}</td></tr>
      <tr><td>Amount Donated</td><td>₹${donation.amount.toLocaleString('en-IN')}</td></tr>
      <tr><td>Tax Saving (Sec 80G)</td><td>₹${taxSaving.toLocaleString('en-IN')}</td></tr>
      <tr><td>Date</td><td>${dateStr}</td></tr>
      <tr><td>Payment ID</td><td>${donation.paymentDetails.paymentId}</td></tr>
    </table>
    <p>Your donation is eligible for a <strong>50% tax deduction</strong> under Section 80G of the Income Tax Act. The attached PDF receipt is your official certificate.</p>
    <p>Thank you for making India a better place — one donation at a time.</p>
  `;

  await transporter.sendMail({
    from: `"Saahaya Platform" <${process.env.EMAIL_USER}>`,
    to: donor.email,
    subject: `Donation Receipt — ₹${donation.amount} to ${ngo.name} | ${donation.taxReceipt.receiptNumber}`,
    html: emailWrapper(content),
    attachments: [
      {
        filename: `${donation.taxReceipt.receiptNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};

// ── 3. NGO APPROVAL EMAIL ─────────────────────────────────────────────────────
const sendNGOApprovalEmail = async (ngoUser, ngoName) => {
  const transporter = createTransporter();

  const content = `
    <h2>Your NGO Has Been Approved! ✅</h2>
    <p>Dear <strong>${ngoUser.name}</strong>, we are delighted to inform you that <strong>${ngoName}</strong> has been verified and approved on the Saahaya platform.</p>
    <div class="highlight-box">
      <p>🎉 Your NGO is now live and ready to receive donations from donors across India!</p>
    </div>
    <p>Here's what happens next:</p>
    <ul style="padding-left: 20px; color: #555; line-height: 2;">
      <li>Your NGO profile is now publicly visible on Saahaya</li>
      <li>Donors can discover and donate to your cause</li>
      <li>All donations will be tracked in your NGO dashboard</li>
      <li>You will receive email notifications for every donation received</li>
    </ul>
    <p style="margin-top:20px">Log in to your dashboard to update your impact metrics and connect with donors.</p>
  `;

  await transporter.sendMail({
    from: `"Saahaya Platform" <${process.env.EMAIL_USER}>`,
    to: ngoUser.email,
    subject: `🎉 Congratulations! ${ngoName} is now Verified on Saahaya`,
    html: emailWrapper(content)
  });
};

// ── 4. NGO REJECTION EMAIL ────────────────────────────────────────────────────
const sendNGORejectionEmail = async (ngoUser, ngoName, reason) => {
  const transporter = createTransporter();

  const content = `
    <h2>NGO Verification Update</h2>
    <p>Dear <strong>${ngoUser.name}</strong>, we have reviewed the application for <strong>${ngoName}</strong> and unfortunately we are unable to approve it at this time.</p>
    <div class="highlight-box">
      <p><strong>Reason for Rejection:</strong></p>
      <p style="margin-top:8px; font-weight:400;">${reason}</p>
    </div>
    <p>This does not mean your application is permanently rejected. You can address the issues mentioned above and reapply. Here are the common steps to resolve rejections:</p>
    <ul style="padding-left: 20px; color: #555; line-height: 2;">
      <li>Ensure all uploaded documents are clear and legible</li>
      <li>Verify that your registration number is correct</li>
      <li>Upload a valid 80G certificate if not already done</li>
      <li>Provide accurate bank account details</li>
    </ul>
    <p style="margin-top:20px">Once you have resolved the issues, you can update your documents and our team will re-review your application. We appreciate your effort and commitment to social good.</p>
  `;

  await transporter.sendMail({
    from: `"Saahaya Platform" <${process.env.EMAIL_USER}>`,
    to: ngoUser.email,
    subject: `Important: Update on your NGO Verification — ${ngoName}`,
    html: emailWrapper(content)
  });
};

module.exports = {
  sendWelcomeEmail,
  sendDonationReceiptEmail,
  sendNGOApprovalEmail,
  sendNGORejectionEmail
};
