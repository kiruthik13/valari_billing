import puppeteer from 'puppeteer';
import { bucket } from '../config/firebase.js';
import { renderInvoiceHtml } from './invoiceTemplate.js';

/**
 * Generate PDF from invoice data using Puppeteer
 * @param {Object} invoice - Invoice data
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoicePdf(invoiceData) {
    let browser;

    try {
        const html = renderInvoiceHtml(invoiceData);

        // Launch Puppeteer with production-ready options
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ||
                process.env.CHROME_BIN ||
                puppeteer.executablePath()
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
        return pdfBuffer;
    } catch (error) {
        if (browser) await browser.close();
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
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
