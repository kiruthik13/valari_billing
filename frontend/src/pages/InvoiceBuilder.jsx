import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, invoicesAPI } from '../services/api';
import { calculateLineItem, calculateInvoiceTotals, formatCurrency } from '../utils/helpers';

// Default company details for Valari
const DEFAULT_COMPANY = {
    name: 'VALARI IYARKAI VELAN URPATHI MAIYAM',
    address: '51-A, SORIYAMPALAYAM, VAZHAITHOTTAM (Po), SIVAGIRI - 638109, ERODE (Dt)',
    phone: '8056638446, 9976238446',
    email: 'valari@example.com',
    gstin: '33AFNPM8201K1ZB',
    logoUrl: ''
};

export default function InvoiceBuilder() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [showProductSelector, setShowProductSelector] = useState(false);

    const [companyDetails, setCompanyDetails] = useState(DEFAULT_COMPANY);
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        address: '',
        phone: '',
        email: ''
    });

    const [items, setItems] = useState([]);
    const [shipping, setShipping] = useState(0);
    const [paymentTerms, setPaymentTerms] = useState('Net 15');
    const [notes, setNotes] = useState('Thank you for your business!');
    const [dueDate, setDueDate] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
        // Set default due date to 15 days from now
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 15);
        setDueDate(defaultDueDate.toISOString().slice(0, 10));
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setProducts(response.data);
        } catch (err) {
            console.error('Failed to load products:', err);
        }
    };

    const addProduct = (product) => {
        const newItem = {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            unitPrice: product.unitPrice,
            gstRate: product.gstRate,
            quantity: 1,
            discountPercent: 0,
            imageUrl: product.imageUrl
        };
        setItems([...items, newItem]);
        setShowProductSelector(false);
    };

    const addCustomItem = () => {
        const newItem = {
            productId: null,
            name: '',
            sku: '',
            unitPrice: 0,
            gstRate: 18,
            quantity: 1,
            discountPercent: 0,
            imageUrl: null
        };
        setItems([...items, newItem]);
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculatedItems = items.map(item => calculateLineItem(item));
    const totals = calculateInvoiceTotals(calculatedItems, parseFloat(shipping) || 0, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const invoiceData = {
                companyDetails,
                customerDetails,
                items: calculatedItems,
                shipping: parseFloat(shipping) || 0,
                paymentTerms,
                notes,
                dueDate
            };

            const response = await invoicesAPI.create(invoiceData);
            navigate(`/invoices/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create invoice');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Invoice</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Company Details */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={companyDetails.name}
                                    onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    value={companyDetails.address}
                                    onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={companyDetails.phone}
                                        onChange={(e) => setCompanyDetails({ ...companyDetails, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={companyDetails.email}
                                        onChange={(e) => setCompanyDetails({ ...companyDetails, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={companyDetails.gstin}
                                    onChange={(e) => setCompanyDetails({ ...companyDetails, gstin: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Details</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={customerDetails.name}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    value={customerDetails.address}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={customerDetails.phone}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={customerDetails.email}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="card mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Items</h2>
                        <div className="space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowProductSelector(true)}
                                className="btn-primary"
                            >
                                + Add Product
                            </button>
                            <button
                                type="button"
                                onClick={addCustomItem}
                                className="btn-secondary"
                            >
                                + Custom Item
                            </button>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No items added. Add products or custom items.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">#</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Item</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Price</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Qty</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Disc%</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">GST%</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Total</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const calculated = calculateLineItem(item);
                                        return (
                                            <tr key={index} className="border-b">
                                                <td className="px-3 py-2 text-sm">{index + 1}</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        required
                                                        className="input-field text-sm"
                                                        placeholder="Item name"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        className="input-field text-sm text-right w-24"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        className="input-field text-sm text-center w-16"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        className="input-field text-sm text-center w-16"
                                                        value={item.discountPercent}
                                                        onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        className="input-field text-sm text-center w-16"
                                                        value={item.gstRate}
                                                        onChange={(e) => updateItem(index, 'gstRate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-right text-sm font-semibold">
                                                    {formatCurrency(calculated.lineTotal)}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Totals and Additional Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="input-field"
                                    value={shipping}
                                    onChange={(e) => setShipping(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                            </div>
                            {totals.totalDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Discount:</span>
                                    <span className="font-semibold text-red-600">-{formatCurrency(totals.totalDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total GST:</span>
                                <span className="font-semibold">{formatCurrency(totals.totalGST)}</span>
                            </div>
                            {totals.shipping > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-semibold">{formatCurrency(totals.shipping)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-gray-900">Grand Total:</span>
                                    <span className="text-primary-600">{formatCurrency(totals.grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || items.length === 0}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Invoice...' : 'Save & Generate PDF'}
                    </button>
                </div>
            </form>

            {/* Product Selector Modal */}
            {showProductSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Select Product</h2>
                                <button
                                    onClick={() => setShowProductSelector(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => addProduct(product)}
                                        className="border rounded-lg p-4 hover:border-primary-500 hover:shadow-md cursor-pointer transition-all"
                                    >
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-32 object-cover rounded mb-2"
                                            />
                                        )}
                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                        {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                                        <p className="text-lg font-bold text-primary-600 mt-2">
                                            {formatCurrency(product.unitPrice)}
                                        </p>
                                        <p className="text-xs text-gray-500">GST: {product.gstRate}%</p>
                                    </div>
                                ))}
                            </div>

                            {products.length === 0 && (
                                <p className="text-center text-gray-500 py-8">
                                    No products available. Create products first.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
