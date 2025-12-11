import { calculateLineItem, calculateInvoiceTotals, calculateRounding } from '../utils/calculations.js';

describe('Invoice Calculations', () => {
    describe('calculateLineItem', () => {
        test('should calculate line item with discount', () => {
            const item = {
                unitPrice: 100,
                quantity: 2,
                discountPercent: 10,
                gstRate: 18
            };

            const result = calculateLineItem(item);

            expect(result.lineSubtotal).toBe(200);
            expect(result.itemDiscount).toBe(20);
            expect(result.taxableAmount).toBe(180);
            expect(result.gstAmount).toBe(32.40);
            expect(result.lineTotal).toBe(212.40);
        });

        test('should calculate line item without discount', () => {
            const item = {
                unitPrice: 45000,
                quantity: 1,
                discountPercent: 0,
                gstRate: 18
            };

            const result = calculateLineItem(item);

            expect(result.lineSubtotal).toBe(45000);
            expect(result.itemDiscount).toBe(0);
            expect(result.taxableAmount).toBe(45000);
            expect(result.gstAmount).toBe(8100);
            expect(result.lineTotal).toBe(53100);
        });

        test('should handle different GST rates', () => {
            const item = {
                unitPrice: 15000,
                quantity: 1,
                discountPercent: 0,
                gstRate: 12
            };

            const result = calculateLineItem(item);

            expect(result.gstAmount).toBe(1800);
            expect(result.lineTotal).toBe(16800);
        });

        test('should handle zero GST rate', () => {
            const item = {
                unitPrice: 500,
                quantity: 1,
                discountPercent: 0,
                gstRate: 0
            };

            const result = calculateLineItem(item);

            expect(result.gstAmount).toBe(0);
            expect(result.lineTotal).toBe(500);
        });
    });

    describe('calculateInvoiceTotals', () => {
        test('should calculate aggregate totals with multiple items', () => {
            const items = [
                {
                    lineSubtotal: 45000,
                    itemDiscount: 0,
                    taxableAmount: 45000,
                    gstAmount: 8100,
                    lineTotal: 53100
                },
                {
                    lineSubtotal: 1798,
                    itemDiscount: 0,
                    taxableAmount: 1798,
                    gstAmount: 323.64,
                    lineTotal: 2121.64
                }
            ];

            const result = calculateInvoiceTotals(items, 100, 0.36);

            expect(result.subtotal).toBe(46798);
            expect(result.totalDiscount).toBe(0);
            expect(result.totalGST).toBe(8423.64);
            expect(result.shipping).toBe(100);
            expect(result.rounding).toBe(0.36);
            expect(result.grandTotal).toBe(55322);
        });

        test('should calculate totals with discounts', () => {
            const items = [
                {
                    lineSubtotal: 200,
                    itemDiscount: 20,
                    taxableAmount: 180,
                    gstAmount: 32.40,
                    lineTotal: 212.40
                },
                {
                    lineSubtotal: 300,
                    itemDiscount: 15,
                    taxableAmount: 285,
                    gstAmount: 51.30,
                    lineTotal: 336.30
                }
            ];

            const result = calculateInvoiceTotals(items, 50, 0);

            expect(result.subtotal).toBe(500);
            expect(result.totalDiscount).toBe(35);
            expect(result.totalGST).toBe(83.70);
            expect(result.grandTotal).toBe(598.70);
        });
    });

    describe('calculateRounding', () => {
        test('should round to nearest', () => {
            expect(calculateRounding(55321.64, 'nearest')).toBe(0.36);
            expect(calculateRounding(55321.40, 'nearest')).toBe(-0.40);
        });

        test('should round up', () => {
            expect(calculateRounding(55321.64, 'up')).toBe(0.36);
            expect(calculateRounding(55321.01, 'up')).toBe(0.99);
        });

        test('should round down', () => {
            expect(calculateRounding(55321.64, 'down')).toBe(-0.64);
            expect(calculateRounding(55321.99, 'down')).toBe(-0.99);
        });
    });
});
