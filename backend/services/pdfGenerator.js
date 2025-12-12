import { renderInvoiceHtml } from './invoiceTemplate.js';

/**
 * Generate PDF from invoice data
 * Works both locally (Windows/Mac) and on Render (Linux)
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoicePdf(invoiceData) {
    let browser;
    let puppeteer;

    try {
        const html = renderInvoiceHtml(invoiceData);

        // Detect environment and use appropriate Puppeteer
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            // Production (Render) - use @sparticuz/chromium
            const chromium = await import('@sparticuz/chromium');
            puppeteer = await import('puppeteer-core');

            console.log('🚀 Using @sparticuz/chromium for production');
            browser = await puppeteer.default.launch({
                args: chromium.default.args,
                defaultViewport: chromium.default.defaultViewport,
                executablePath: await chromium.default.executablePath(),
                headless: chromium.default.headless,
            });
        } else {
            // Local development - use regular puppeteer
            puppeteer = await import('puppeteer');

            console.log('🚀 Using regular Puppeteer for local development');
            browser = await puppeteer.default.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }

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
