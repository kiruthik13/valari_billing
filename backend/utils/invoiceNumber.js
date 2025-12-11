import { db } from '../config/firebase.js';

/**
 * Generate unique invoice number in format INV-YYYYMMDD-0001
 * @returns {Promise<string>} Generated invoice number
 */
export async function generateInvoiceNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    const counterRef = db.collection('counters').doc('invoices');

    try {
        const result = await db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            let seq = 1;

            if (counterDoc.exists) {
                const data = counterDoc.data();
                if (data.date === dateStr) {
                    // Same day, increment sequence
                    seq = (data.seq || 0) + 1;
                }
                // else: New day, reset to 1
            }

            // Update counter
            transaction.set(counterRef, { date: dateStr, seq }, { merge: true });

            // Format sequence with leading zeros
            const seqStr = seq.toString().padStart(4, '0');
            return `INV-${dateStr}-${seqStr}`;
        });

        return result;
    } catch (error) {
        console.error('Error generating invoice number:', error);
        throw new Error('Failed to generate invoice number');
    }
}
