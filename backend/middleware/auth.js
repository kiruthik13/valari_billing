import dotenv from 'dotenv';

dotenv.config();

/**
 * Verify API key middleware
 */
export function verifyApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.INVOICE_API_KEY;

    if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
    }

    if (apiKey !== expectedKey) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    next();
}
