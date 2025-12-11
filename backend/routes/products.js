import express from 'express';
import { db, bucket } from '../config/firebase.js';
import { validateProduct, validateImage } from '../utils/validation.js';
import { verifyApiKey } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/products - Create a new product
 */
router.post('/', verifyApiKey, async (req, res) => {
    try {
        const { name, sku, description, unitPrice, gstRate, imageBase64 } = req.body;

        // Validate input
        const errors = validateProduct({ name, unitPrice, gstRate });
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Prepare product data
        const productData = {
            name: name.trim(),
            sku: sku?.trim() || null,
            description: description?.trim() || null,
            unitPrice: parseFloat(unitPrice),
            gstRate: parseFloat(gstRate),
            imageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Create product document
        const productRef = await db.collection('products').add(productData);
        const productId = productRef.id;

        // Handle image upload if provided
        if (imageBase64) {
            try {
                const imageData = validateImage(imageBase64);
                if (imageData) {
                    const fileName = `products/${productId}.jpg`;
                    const file = bucket.file(fileName);

                    await file.save(imageData.buffer, {
                        metadata: { contentType: imageData.contentType },
                        public: true
                    });

                    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

                    // Update product with image URL
                    await productRef.update({ imageUrl });
                    productData.imageUrl = imageUrl;
                }
            } catch (imageError) {
                console.error('Image upload error:', imageError);
                // Continue without image
            }
        }

        res.status(201).json({
            id: productId,
            ...productData
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

/**
 * GET /api/products - List all products
 */
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();

        const products = [];
        snapshot.forEach(doc => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

/**
 * GET /api/products/:id - Get single product
 */
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

/**
 * PUT /api/products/:id - Update product
 */
router.put('/:id', verifyApiKey, async (req, res) => {
    try {
        const { name, sku, description, unitPrice, gstRate, imageBase64 } = req.body;

        const productRef = db.collection('products').doc(req.params.id);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updateData = {
            name,
            sku: sku || null,
            description: description || '',
            unitPrice: parseFloat(unitPrice),
            gstRate: parseFloat(gstRate),
            updatedAt: new Date().toISOString()
        };

        // Handle image update if provided
        if (imageBase64) {
            try {
                const base64Data = imageBase64.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `products/${req.params.id}.png`;
                const file = bucket.file(fileName);

                await file.save(buffer, {
                    metadata: { contentType: 'image/png' },
                    public: true
                });

                updateData.imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            } catch (error) {
                console.error('Image upload error:', error.message);
            }
        }

        await productRef.update(updateData);

        res.json({
            id: req.params.id,
            ...updateData
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

/**
 * DELETE /api/products/:id - Delete product
 */
router.delete('/:id', verifyApiKey, async (req, res) => {
    try {
        const productRef = db.collection('products').doc(req.params.id);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await productRef.delete();

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
