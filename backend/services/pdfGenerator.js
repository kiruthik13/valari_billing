import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { renderInvoiceHtml } from './invoiceTemplate.js';

/**
 * Generate PDF from invoice data using @sparticuz/chromium
 * Works on Render free tier - no system dependencies needed!
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoicePdf(invoiceData) {
    let browser;
    try {
        const html = renderInvoiceHtml(invoiceData);

        // Launch browser with @sparticuz/chromium (works on Render free tier)
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        await browser.close();
        console.log('✅ PDF generated successfully');
        return pdfBuffer;
    } catch (error) {
        if (browser) await browser.close();
        console.error('❌ PDF generation error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
}

/**
 * Upload PDF to Firebase Storage (optional)
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} invoiceNumber - Invoice number
 * @returns {Promise<string>} Public URL
 */
export async function uploadPdfToStorage(pdfBuffer, invoiceNumber) {
    const { bucket } = await import('../config/firebase.js');
    const fileName = `invoices/${invoiceNumber}.pdf`;
    const file = bucket.file(fileName);

    await file.save(pdfBuffer, {
        metadata: {
            contentType: 'application/pdf'
        }
    });

    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}
