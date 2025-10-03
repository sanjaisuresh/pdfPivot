// utils/templates/paymentConfirmation.ts
exports.paymentEmailTemplate = (payment) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;padding:20px;border-radius:10px;border:1px solid #ddd;">
    <div style="text-align:center;">
      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Logo" style="width:80px;margin-bottom:10px;" />
      <h2 style="color:#333;">Payment Confirmation</h2>
    </div>

    <p>Hi <strong>${payment.billingDetails.name}</strong>,</p>
    <p>Thank you for your payment. Here are the details:</p>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr><td><strong>Amount:</strong></td><td>$${payment.amount/100}</td></tr>
      <tr><td><strong>Plan:</strong></td><td>${payment.billingType.toUpperCase()} Plan</td></tr>
      <tr><td><strong>Payment Status:</strong></td><td>${payment.status}</td></tr>
      <tr><td><strong>Card:</strong></td><td>${payment.paymentMethod.brand.toUpperCase()} **** **** **** ${payment.paymentMethod.last4}</td></tr>
      <tr><td><strong>Billing Period:</strong></td><td>${new Date(payment.billingCycle.startDate).toLocaleDateString()} to ${new Date(payment.billingCycle.endDate).toLocaleDateString()}</td></tr>
    </table>

    <div style="text-align:center;margin:20px 0;">
      <a href="${payment.receiptUrl}" style="background:#0f62fe;color:#fff;text-decoration:none;padding:10px 20px;border-radius:5px;">View Receipt</a>
    </div>

    <p>If you have any questions, feel free to reply to this email.</p>

    <hr style="margin-top:30px;" />
    <p style="font-size:12px;color:#777;text-align:center;">© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
  </div>
`;
