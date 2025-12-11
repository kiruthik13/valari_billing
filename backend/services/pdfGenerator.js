import puppeteer from 'puppeteer';
import { bucket } from '../config/firebase.js';
import { renderInvoiceHtml } from './invoiceTemplate.js';

/**
 * Generate PDF from invoice data using Puppeteer
 * @param {Object} invoice - Invoice data
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoicePdf(invoice) {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        const html = renderInvoiceHtml(invoice);

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        return pdfBuffer;
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Upload PDF to Firebase Storage
 * @param {string} invoiceId - Invoice document ID
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<string>} Public URL of uploaded PDF
 */
export async function uploadPdfToStorage(invoiceId, pdfBuffer) {
    try {
        const fileName = `invoices/${invoiceId}.pdf`;
        const file = bucket.file(fileName);

        await file.save(pdfBuffer, {
            metadata: {
                contentType: 'application/pdf'
            },
            public: true
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        return publicUrl;
    } catch (error) {
        console.error('PDF upload error:', error);
        throw new Error('Failed to upload PDF to storage');
    }
}
