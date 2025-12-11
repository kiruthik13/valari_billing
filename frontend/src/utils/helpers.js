const CURRENCY = '₹';

/**
 * Calculate individual line item totals (client-side)
 */
export function calculateLineItem(item) {
    const lineSubtotal = parseFloat((item.unitPrice * item.quantity).toFixed(2));
    const itemDiscount = parseFloat((lineSubtotal * ((item.discountPercent || 0) / 100)).toFixed(2));
    const taxableAmount = parseFloat((lineSubtotal - itemDiscount).toFixed(2));
    const gstAmount = parseFloat((taxableAmount * (item.gstRate / 100)).toFixed(2));
    const lineTotal = parseFloat((taxableAmount + gstAmount).toFixed(2));

    return {
        ...item,
        lineSubtotal,
        itemDiscount,
        taxableAmount,
        gstAmount,
        lineTotal
    };
}

/**
 * Calculate invoice aggregate totals (client-side)
 */
export function calculateInvoiceTotals(items, shipping = 0, rounding = 0) {
    const subtotal = parseFloat(items.reduce((sum, item) => sum + item.lineSubtotal, 0).toFixed(2));
    const totalDiscount = parseFloat(items.reduce((sum, item) => sum + item.itemDiscount, 0).toFixed(2));
    const totalGST = parseFloat(items.reduce((sum, item) => sum + item.gstAmount, 0).toFixed(2));
    const grandTotal = parseFloat((subtotal - totalDiscount + totalGST + shipping + rounding).toFixed(2));

    return {
        subtotal,
        totalDiscount,
        totalGST,
        shipping: parseFloat(shipping.toFixed(2)),
        rounding: parseFloat(rounding.toFixed(2)),
        grandTotal
    };
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
    return `${CURRENCY}${parseFloat(amount).toFixed(2)}`;
}

/**
 * Convert file to base64
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
