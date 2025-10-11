const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.pdfpivot.com",
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
  logger: false,
  debug: false,
});

exports.sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"PdfPivot" <info@pdfpivot.com>`, // must match verified domain
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", to);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};
