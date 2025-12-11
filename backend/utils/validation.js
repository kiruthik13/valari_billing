/**
 * Validate product input data
 */
export function validateProduct(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        errors.push('Product name is required');
    }

    if (data.unitPrice === undefined || data.unitPrice === null) {
        errors.push('Unit price is required');
    } else if (typeof data.unitPrice !== 'number' || data.unitPrice < 0) {
        errors.push('Unit price must be a non-negative number');
    }

    if (data.gstRate === undefined || data.gstRate === null) {
        errors.push('GST rate is required');
    } else if (typeof data.gstRate !== 'number' || data.gstRate < 0 || data.gstRate > 100) {
        errors.push('GST rate must be between 0 and 100');
    }

    return errors;
}

/**
 * Validate invoice input data
 */
export function validateInvoice(data) {
    const errors = [];

    if (!data.companyDetails || !data.companyDetails.name) {
        errors.push('Company name is required');
    }

    if (!data.customerDetails || !data.customerDetails.name) {
        errors.push('Customer name is required');
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        errors.push('At least one item is required');
    } else {
        data.items.forEach((item, index) => {
            if (!item.name) errors.push(`Item ${index + 1}: name is required`);
            if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
                errors.push(`Item ${index + 1}: valid unit price is required`);
            }
            if (typeof item.gstRate !== 'number' || item.gstRate < 0 || item.gstRate > 100) {
                errors.push(`Item ${index + 1}: GST rate must be between 0 and 100`);
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                errors.push(`Item ${index + 1}: quantity must be greater than 0`);
            }
            if (item.discountPercent !== undefined && (typeof item.discountPercent !== 'number' || item.discountPercent < 0 || item.discountPercent > 100)) {
                errors.push(`Item ${index + 1}: discount percent must be between 0 and 100`);
            }
        });
    }

    return errors;
}

/**
 * Validate and parse base64 image
 */
export function validateImage(imageBase64) {
    if (!imageBase64) return null;

    // Check if it's a data URL
    const dataUrlRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    if (!dataUrlRegex.test(imageBase64)) {
        throw new Error('Invalid image format. Must be base64 data URL');
    }

    // Extract base64 data
    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Check size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (buffer.length > maxSize) {
        throw new Error('Image size exceeds 2MB limit');
    }

    // Determine content type
    const match = imageBase64.match(dataUrlRegex);
    const contentType = `image/${match[1]}`;

    return { buffer, contentType };
}
