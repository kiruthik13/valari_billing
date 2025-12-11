import express from 'express';
import { db } from '../config/firebase.js';
import { validateInvoice } from '../utils/validation.js';
import { calculateLineItem, calculateInvoiceTotals } from '../utils/calculations.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';
import { generateInvoicePdf, uploadPdfToStorage } from '../services/pdfGenerator.js';
import { sendInvoiceEmail } from '../services/emailService.js';
import { verifyApiKey } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/invoices - List all invoices
 */
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();

        const invoices = [];
        snapshot.forEach(doc => {
            invoices.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

/**
 * GET /api/invoices/:id - Get invoice details
 */
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('invoices').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});

/**
 * POST /api/invoices - Create new invoice
 */
router.post('/', verifyApiKey, async (req, res) => {
    try {
        const { companyDetails, customerDetails, shippingDetails, items, shipping, paymentTerms, notes } = req.body;

        // Validate input
        const errors = validateInvoice({ companyDetails, customerDetails, items });
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Calculate line items
        const calculatedItems = items.map(item => {
            const itemWithDefaults = {
                productId: item.productId || null,
                name: item.name,
                sku: item.sku || null,
                unitPrice: parseFloat(item.unitPrice),
                gstRate: parseFloat(item.gstRate),
                quantity: parseFloat(item.quantity),
                discountPercent: parseFloat(item.discountPercent || 0),
                imageUrl: item.imageUrl || null
            };
            return calculateLineItem(itemWithDefaults);
        });

        // Calculate totals
        const totals = calculateInvoiceTotals(calculatedItems, parseFloat(shipping || 0), 0);

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();

        // Prepare invoice data
        const invoiceData = {
            invoiceNumber,
            date: new Date().toISOString().slice(0, 10),
            dueDate: req.body.dueDate || null,
            companyDetails: {
                name: companyDetails.name,
                address: companyDetails.address || '',
                phone: companyDetails.phone || '',
                email: companyDetails.email || '',
                logoUrl: companyDetails.logoUrl || '',
                gstin: companyDetails.gstin || ''
            },
            customerDetails: {
                name: customerDetails.name,
                address: customerDetails.address || '',
                phone: customerDetails.phone || '',
                email: customerDetails.email || ''
            },
            shippingDetails: shippingDetails || null,
            items: calculatedItems,
            ...totals,
            paymentTerms: paymentTerms || null,
            notes: notes || null,
            pdfUrl: null,
            status: 'draft',
            createdAt: new Date().toISOString()
        };

        // Save invoice to Firestore
        const invoiceRef = await db.collection('invoices').add(invoiceData);
        const invoiceId = invoiceRef.id;

        // Skip PDF upload - generate on-demand instead
        console.log('✅ Invoice created successfully (PDF will be generated on-demand)');

        res.status(200).json({
            id: invoiceId,
            invoiceNumber: invoiceData.invoiceNumber,
            pdfUrl: `/api/invoices/${invoiceId}/pdf`,
            grandTotal: invoiceData.grandTotal
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

/**
 * GET /api/invoices/:id/pdf - Get or generate invoice PDF
 */
router.get('/:id/pdf', async (req, res) => {
    try {
        const doc = await db.collection('invoices').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = doc.data();

        // If PDF URL exists, redirect to it
        if (invoice.pdfUrl) {
            return res.redirect(invoice.pdfUrl);
        }

        // Generate PDF on the fly
        const pdfBuffer = await generateInvoicePdf(invoice);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

/**
 * POST /api/invoices/:id/email - Send invoice via email
 */
router.post('/:id/email', verifyApiKey, async (req, res) => {
    try {
        const { toEmail } = req.body;

        if (!toEmail) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }

        const doc = await db.collection('invoices').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = doc.data();

        // Generate PDF if not exists
        let pdfBuffer;
        if (invoice.pdfUrl) {
            // Download from storage
            const response = await fetch(invoice.pdfUrl);
            pdfBuffer = Buffer.from(await response.arrayBuffer());
        } else {
            pdfBuffer = await generateInvoicePdf(invoice);
        }

        // Send email
        await sendInvoiceEmail(toEmail, invoice, pdfBuffer);

        res.json({ success: true, message: 'Invoice sent successfully' });
    } catch (error) {
        console.error('Error sending invoice email:', error);

        if (error.message.includes('SMTP configuration')) {
            return res.status(400).json({ error: 'Email service is not configured' });
        }

        res.status(500).json({ error: 'Failed to send invoice email' });
    }
});

/**
 * DELETE /api/invoices/:id - Delete single invoice
 */
router.delete('/:id', verifyApiKey, async (req, res) => {
    try {
        const invoiceRef = db.collection('invoices').doc(req.params.id);
        const doc = await invoiceRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        await invoiceRef.delete();

        res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});

/**
 * DELETE /api/invoices - Clear all invoices
 */
router.delete('/', verifyApiKey, async (req, res) => {
    try {
        const snapshot = await db.collection('invoices').get();
        const batch = db.batch();

        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.json({ success: true, message: `Deleted ${snapshot.size} invoices`, count: snapshot.size });
    } catch (error) {
        console.error('Error clearing invoices:', error);
        res.status(500).json({ error: 'Failed to clear invoices' });
    }
});

export default router;
