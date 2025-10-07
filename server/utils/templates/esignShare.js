function eSignTemplate({ owner_name, member_name, member_email, pdf_id }) {
  const pdfLink = `${process.env.CLIENT_URL}/sign-pdf?file_id=${pdf_id}`;

  return {
    subject: `Document Signature Request from ${owner_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f7f8fa; padding: 20px;">
        <div style="max-width: 600px; background: #fff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background-color: #0056d2; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">PDF Pivot - E-Sign Request</h2>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${member_name}</strong>,</p>
            
            <p style="font-size: 15px; line-height: 1.6;">
              <strong>${owner_name}</strong> has requested your signature on a document using PDF Pivot’s e-sign service.
            </p>
            
            <p style="font-size: 15px; line-height: 1.6;">
              Please review and sign the document using the secure link below:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${pdfLink}" target="_blank" 
                 style="background-color: #0056d2; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                 Review & Sign Document
              </a>
            </div>
            
            <p style="font-size: 14px; color: #555;">
              If you did not expect this email, you can safely ignore it. This link is unique to your email address: <strong>${member_email}</strong>.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
            
            <p style="font-size: 13px; color: #777; text-align: center;">
              © ${new Date().getFullYear()} PDF Pivot. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

module.exports = { eSignTemplate };
