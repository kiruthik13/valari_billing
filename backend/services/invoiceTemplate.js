import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const CURRENCY = process.env.CURRENCY_SYMBOL || '₹';
const LOGO_BASE64 = readFileSync('./logo_b64.txt', 'utf8').trim();

/**
 * Generate HTML template for invoice PDF
 */
export function renderInvoiceHtml(invoice) {
  const itemsHtml = invoice.items.map((item, index) => `
    <tr>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 11px;">${index + 1}</td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 3px;">` : ''}
          <div>
            <div style="font-weight: 600;">${item.name}</div>
            ${item.sku ? `<div style="font-size: 10px; color: #6b7280;">SKU: ${item.sku}</div>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 11px;">${CURRENCY}${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 11px;">${item.quantity}</td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 11px;">${item.discountPercent || 0}%</td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 11px;">${item.gstRate}%</td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 11px;">${CURRENCY}${item.taxableAmount.toFixed(2)}</td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 11px;">${CURRENCY}${item.gstAmount.toFixed(2)}</td>
      <td style="padding: 6px 4px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; font-size: 11px;">${CURRENCY}${item.lineTotal.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #059669; }
    .logo-section img { max-width: 120px; height: auto; }
    .company-info { text-align: left; max-width: 400px; }
    .company-name { font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 8px; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 32px; font-weight: 700; color: #059669; margin-bottom: 8px; }
    .invoice-number { font-size: 16px; font-weight: 600; color: #374151; }
    .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .meta-box { flex: 1; }
    .meta-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
    .meta-value { font-size: 14px; color: #1f2937; }
    .addresses { display: flex; gap: 40px; margin-bottom: 30px; }
    .address-box { flex: 1; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #059669; }
    .address-title { font-size: 14px; font-weight: 700; color: #059669; margin-bottom: 12px; text-transform: uppercase; }
    .address-line { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background: #059669; color: white; }
    thead th { padding: 12px 8px; text-align: left; font-weight: 600; font-size: 13px; }
    .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
    .totals-table { width: 400px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .totals-label { font-weight: 600; color: #374151; }
    .totals-value { color: #1f2937; }
    .grand-total { background: #059669; color: white; padding: 12px; margin-top: 8px; border-radius: 4px; font-size: 18px; font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
    .footer-section { margin-bottom: 16px; }
    .footer-label { font-weight: 600; color: #374151; margin-bottom: 4px; }
    .footer-value { color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-section">
        <img src="data:image/png;base64,${LOGO_BASE64}" alt="Valari Logo">
        <div class="company-info">
          <div class="company-name">${invoice.companyDetails.name}</div>
          <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
            ${invoice.companyDetails.address || ''}<br>
            ${invoice.companyDetails.phone ? `Phone: ${invoice.companyDetails.phone}<br>` : ''}
            ${invoice.companyDetails.email ? `Email: ${invoice.companyDetails.email}<br>` : ''}
            ${invoice.companyDetails.gstin ? `GSTIN: ${invoice.companyDetails.gstin}` : ''}
          </div>
        </div>
      </div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>
    </div>

    <div class="invoice-meta">
      <div class="meta-box">
        <div class="meta-label">Invoice Date</div>
        <div class="meta-value">${invoice.date}</div>
      </div>
      ${invoice.dueDate ? `
      <div class="meta-box">
        <div class="meta-label">Due Date</div>
        <div class="meta-value">${invoice.dueDate}</div>
      </div>
      ` : ''}
    </div>

    <div class="addresses">
      <div class="address-box">
        <div class="address-title">Bill To</div>
        <div class="address-line" style="font-weight: 600; font-size: 16px;">${invoice.customerDetails.name}</div>
        ${invoice.customerDetails.address ? `<div class="address-line">${invoice.customerDetails.address}</div>` : ''}
        ${invoice.customerDetails.phone ? `<div class="address-line">Phone: ${invoice.customerDetails.phone}</div>` : ''}
        ${invoice.customerDetails.email ? `<div class="address-line">Email: ${invoice.customerDetails.email}</div>` : ''}
      </div>
      ${invoice.shippingDetails ? `
      <div class="address-box">
        <div class="address-title">Ship To</div>
        <div class="address-line" style="font-weight: 600; font-size: 16px;">${invoice.shippingDetails.name || invoice.customerDetails.name}</div>
        ${invoice.shippingDetails.address ? `<div class="address-line">${invoice.shippingDetails.address}</div>` : ''}
      </div>
      ` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align: center; width: 40px;">#</th>
          <th>Item</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: center; width: 80px;">Qty</th>
          <th style="text-align: center; width: 80px;">Disc %</th>
          <th style="text-align: center; width: 80px;">GST %</th>
          <th style="text-align: right;">Taxable</th>
          <th style="text-align: right;">GST Amt</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row">
          <div class="totals-label">Subtotal:</div>
          <div class="totals-value">${CURRENCY}${invoice.subtotal.toFixed(2)}</div>
        </div>
        ${invoice.totalDiscount > 0 ? `
        <div class="totals-row">
          <div class="totals-label">Total Discount:</div>
          <div class="totals-value">-${CURRENCY}${invoice.totalDiscount.toFixed(2)}</div>
        </div>
        ` : ''}
        <div class="totals-row">
          <div class="totals-label">Total GST:</div>
          <div class="totals-value">${CURRENCY}${invoice.totalGST.toFixed(2)}</div>
        </div>
        ${invoice.shipping > 0 ? `
        <div class="totals-row">
          <div class="totals-label">Shipping:</div>
          <div class="totals-value">${CURRENCY}${invoice.shipping.toFixed(2)}</div>
        </div>
        ` : ''}
        ${invoice.rounding !== 0 ? `
        <div class="totals-row">
          <div class="totals-label">Rounding:</div>
          <div class="totals-value">${invoice.rounding > 0 ? '+' : ''}${CURRENCY}${invoice.rounding.toFixed(2)}</div>
        </div>
        ` : ''}
        <div class="grand-total">
          <div style="display: flex; justify-content: space-between;">
            <span>Grand Total:</span>
            <span>${CURRENCY}${invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      ${invoice.paymentTerms ? `
      <div class="footer-section">
        <div class="footer-label">Payment Terms</div>
        <div class="footer-value">${invoice.paymentTerms}</div>
      </div>
      ` : ''}
      ${invoice.notes ? `
      <div class="footer-section">
        <div class="footer-label">Notes</div>
        <div class="footer-value">${invoice.notes}</div>
      </div>
      ` : ''}
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        Thank you for your business!
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
