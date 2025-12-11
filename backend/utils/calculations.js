/**
 * Calculate individual line item totals
 * @param {Object} item - Line item with unitPrice, quantity, discountPercent, gstRate
 * @returns {Object} Calculated line item with all amounts
 */
export function calculateLineItem(item) {
    const lineSubtotal = parseFloat((item.unitPrice * item.quantity).toFixed(2));
    const itemDiscount = parseFloat((lineSubtotal * (item.discountPercent / 100)).toFixed(2));
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
 * Calculate invoice aggregate totals
 * @param {Array} items - Array of calculated line items
 * @param {Number} shipping - Shipping amount
 * @param {Number} rounding - Rounding adjustment
 * @returns {Object} Aggregate totals
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
 * Apply rounding to grand total
 * @param {Number} amount - Amount to round
 * @param {String} mode - Rounding mode: 'nearest', 'up', 'down'
 * @returns {Number} Rounding adjustment needed
 */
export function calculateRounding(amount, mode = 'nearest') {
    const rounded = mode === 'up'
        ? Math.ceil(amount)
        : mode === 'down'
            ? Math.floor(amount)
            : Math.round(amount);

    return parseFloat((rounded - amount).toFixed(2));
}
