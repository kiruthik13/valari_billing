import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

/**
 * Initialize email transporter
 */
function getTransporter() {
    if (!transporter) {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpHost || !smtpUser || !smtpPass) {
            throw new Error('SMTP configuration is incomplete');
        }

        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort) || 587,
            secure: parseInt(smtpPort) === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
    }

    return transporter;
}

/**
 * Send invoice email with PDF attachment
 * @param {string} toEmail - Recipient email
 * @param {Object} invoice - Invoice data
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<Object>} Email send result
 */
export async function sendInvoiceEmail(toEmail, invoice, pdfBuffer) {
    try {
        const transport = getTransporter();

        const mailOptions = {
            from: `"${invoice.companyDetails.name}" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: `Invoice ${invoice.invoiceNumber} from ${invoice.companyDetails.name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Invoice ${invoice.invoiceNumber}</h2>
          <p>Dear ${invoice.customerDetails.name},</p>
          <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> dated ${invoice.date}.</p>
          <p><strong>Amount Due: ${process.env.CURRENCY_SYMBOL || '₹'}${invoice.grandTotal.toFixed(2)}</strong></p>
          ${invoice.dueDate ? `<p>Due Date: ${invoice.dueDate}</p>` : ''}
          ${invoice.paymentTerms ? `<p>Payment Terms: ${invoice.paymentTerms}</p>` : ''}
          <p>Thank you for your business!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            ${invoice.companyDetails.name}<br>
            ${invoice.companyDetails.address || ''}<br>
            ${invoice.companyDetails.phone ? `Phone: ${invoice.companyDetails.phone}<br>` : ''}
            ${invoice.companyDetails.email ? `Email: ${invoice.companyDetails.email}` : ''}
          </p>
        </div>
      `,
            attachments: [
                {
                    filename: `Invoice-${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transport.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
}
