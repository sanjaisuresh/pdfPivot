const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.BREVO_USER, // your Brevo login email
    pass: process.env.BREVO_PASS  // Brevo SMTP password (not your login password)
  },
  logger: true,
  debug: true
});

exports.sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"PdfPivot" <info@pdfpivot.com>`, // must match verified domain
      to,
      subject,
      html
    });
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};
