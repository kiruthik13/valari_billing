import { db, bucket } from '../config/firebase.js';
import { calculateLineItem, calculateInvoiceTotals } from '../utils/calculations.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';
import { generateInvoicePdf, uploadPdfToStorage } from '../services/pdfGenerator.js';

// Sample base64 placeholder image (1x1 green pixel)
const SAMPLE_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Company details for Valari
const COMPANY_DETAILS = {
    name: 'VALARI IYARKAI VELAN URPATHI MAIYAM',
    address: '51-A, SORIYAMPALAYAM, VAZHAITHOTTAM (Po), SIVAGIRI - 638109, ERODE (Dt)',
    phone: '8056638446, 9976238446',
    email: 'valari@example.com',
    gstin: '33AFNPM8201K1ZB',
    logoUrl: 'https://storage.googleapis.com/your-bucket/logo.png' // Update with actual logo URL
};

async function createSampleProducts() {
    console.log('📦 Creating sample products...');

    const products = [
        {
            name: 'Laptop X',
            sku: 'LAP-X-001',
            description: 'High-performance laptop for business',
            unitPrice: 45000,
            gstRate: 18,
            imageBase64: SAMPLE_IMAGE_BASE64
        },
        {
            name: 'Phone Y',
            sku: 'PHN-Y-001',
            description: 'Latest smartphone model',
            unitPrice: 15000,
            gstRate: 12,
            imageBase64: SAMPLE_IMAGE_BASE64
        },
        {
            name: 'Mouse Z',
            sku: 'MSE-Z-001',
            description: 'Wireless ergonomic mouse',
            unitPrice: 899,
            gstRate: 18,
            imageBase64: SAMPLE_IMAGE_BASE64
        },
        {
            name: 'Service: Installation',
            sku: 'SRV-INST',
            description: 'Professional installation service',
            unitPrice: 500,
            gstRate: 0,
            imageBase64: null
        }
    ];

    const createdProducts = [];

    for (const product of products) {
        const productData = {
            name: product.name,
            sku: product.sku,
            description: product.description,
            unitPrice: product.unitPrice,
            gstRate: product.gstRate,
            imageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const productRef = await db.collection('products').add(productData);
        const productId = productRef.id;

        // Upload image if provided
        if (product.imageBase64) {
            try {
                const base64Data = product.imageBase64.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `products/${productId}.png`;
                const file = bucket.file(fileName);

                await file.save(buffer, {
                    metadata: { contentType: 'image/png' },
                    public: true
                });

                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                await productRef.update({ imageUrl });
                productData.imageUrl = imageUrl;
            } catch (error) {
                console.error(`Error uploading image for ${product.name}:`, error.message);
            }
        }

        createdProducts.push({ id: productId, ...productData });
        console.log(`✅ Created: ${product.name} (${productId})`);
    }

    return createdProducts;
}

async function createSampleInvoice(products) {
    console.log('\n📄 Creating sample invoice...');

    // Find Laptop X and Mouse Z
    const laptopX = products.find(p => p.name === 'Laptop X');
    const mouseZ = products.find(p => p.name === 'Mouse Z');

    const items = [
        {
            productId: laptopX.id,
            name: laptopX.name,
            sku: laptopX.sku,
            unitPrice: laptopX.unitPrice,
            gstRate: laptopX.gstRate,
            quantity: 1,
            discountPercent: 0,
            imageUrl: laptopX.imageUrl
        },
        {
            productId: mouseZ.id,
            name: mouseZ.name,
            sku: mouseZ.sku,
            unitPrice: mouseZ.unitPrice,
            gstRate: mouseZ.gstRate,
            quantity: 2,
            discountPercent: 0,
            imageUrl: mouseZ.imageUrl
        }
    ];

    // Calculate line items
    const calculatedItems = items.map(item => calculateLineItem(item));

    // Calculate totals
    const totals = calculateInvoiceTotals(calculatedItems, 100, 0.36);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice data
    const invoiceData = {
        invoiceNumber,
        date: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 15 days from now
        companyDetails: COMPANY_DETAILS,
        customerDetails: {
            name: 'John Doe',
            address: '12, Resident Road, Coimbatore - 641001',
            phone: '9876543210',
            email: 'john.doe@example.com'
        },
        items: calculatedItems,
        ...totals,
        paymentTerms: 'Net 15',
        notes: 'Thank you for your business!',
        pdfUrl: null,
        status: 'draft',
        createdAt: new Date().toISOString()
    };

    // Save invoice
    const invoiceRef = await db.collection('invoices').add(invoiceData);
    const invoiceId = invoiceRef.id;

    console.log(`✅ Invoice created: ${invoiceNumber} (${invoiceId})`);

    // Generate PDF
    console.log('📄 Generating PDF...');
    try {
        const pdfBuffer = await generateInvoicePdf(invoiceData);
        const pdfUrl = await uploadPdfToStorage(invoiceId, pdfBuffer);

        await invoiceRef.update({ pdfUrl });
        invoiceData.pdfUrl = pdfUrl;

        console.log(`✅ PDF uploaded: ${pdfUrl}`);
    } catch (error) {
        console.error('❌ PDF generation error:', error.message);
    }

    return { id: invoiceId, ...invoiceData };
}

async function seed() {
    try {
        console.log('🌱 Starting seed process...\n');

        // Create products
        const products = await createSampleProducts();

        // Create sample invoice
        const invoice = await createSampleInvoice(products);

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Products created: ${products.length}`);
        console.log(`   Invoice number: ${invoice.invoiceNumber}`);
        console.log(`   Grand total: ₹${invoice.grandTotal.toFixed(2)}`);
        console.log(`   PDF URL: ${invoice.pdfUrl || 'Not generated'}`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
