import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { invoicesAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function InvoicePreview() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [emailModal, setEmailModal] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState('');

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const response = await invoicesAPI.getById(id);
            setInvoice(response.data);
            setEmailTo(response.data.customerDetails.email || '');
        } catch (err) {
            setError('Failed to load invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        if (invoice.pdfUrl) {
            window.open(invoice.pdfUrl, '_blank');
        } else {
            window.open(invoicesAPI.getPdfUrl(id), '_blank');
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setEmailSending(true);
        setError('');
        setEmailSuccess('');

        try {
            await invoicesAPI.sendEmail(id, emailTo);
            setEmailSuccess('Invoice sent successfully!');
            setTimeout(() => {
                setEmailModal(false);
                setEmailSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send email');
        } finally {
            setEmailSending(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading invoice...</div>;
    }

    if (error && !invoice) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Invoice Preview</h1>
                <div className="space-x-2">
                    <button onClick={handleDownloadPdf} className="btn-primary">
                        📄 Download PDF
                    </button>
                    <button onClick={() => setEmailModal(true)} className="btn-secondary">
                        ✉️ Email Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Display */}
            <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b-4 border-primary-600">
                    <div>
                        {invoice.companyDetails.logoUrl && (
                            <img
                                src={invoice.companyDetails.logoUrl}
                                alt="Company Logo"
                                className="h-16 mb-4"
                            />
                        )}
                        <div className="text-primary-600 font-bold text-xl mb-2">
                            {invoice.companyDetails.name}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                            {invoice.companyDetails.address}<br />
                            {invoice.companyDetails.phone && `Phone: ${invoice.companyDetails.phone}`}<br />
                            {invoice.companyDetails.email && `Email: ${invoice.companyDetails.email}`}<br />
                            {invoice.companyDetails.gstin && `GSTIN: ${invoice.companyDetails.gstin}`}
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-bold text-primary-600 mb-2">INVOICE</h1>
                        <div className="text-lg font-semibold text-gray-800">{invoice.invoiceNumber}</div>
                    </div>
                </div>

                {/* Invoice Meta */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</div>
                        <div className="text-sm text-gray-900">{invoice.date}</div>
                    </div>
                    {invoice.dueDate && (
                        <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</div>
                            <div className="text-sm text-gray-900">{invoice.dueDate}</div>
                        </div>
                    )}
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-600">
                        <div className="text-sm font-bold text-primary-600 uppercase mb-2">Bill To</div>
                        <div className="font-semibold text-gray-900 text-lg mb-1">
                            {invoice.customerDetails.name}
                        </div>
                        <div className="text-sm text-gray-600">
                            {invoice.customerDetails.address && <div>{invoice.customerDetails.address}</div>}
                            {invoice.customerDetails.phone && <div>Phone: {invoice.customerDetails.phone}</div>}
                            {invoice.customerDetails.email && <div>Email: {invoice.customerDetails.email}</div>}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead className="bg-primary-600 text-white">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold">#</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold">Item</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold">Unit Price</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold">Qty</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold">Disc %</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold">GST %</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold">Taxable</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold">GST Amt</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="px-3 py-3 text-sm">{index + 1}</td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-2">
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <div className="font-semibold text-sm">{item.name}</div>
                                                {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                                    <td className="px-3 py-3 text-center text-sm">{item.quantity}</td>
                                    <td className="px-3 py-3 text-center text-sm">{item.discountPercent || 0}%</td>
                                    <td className="px-3 py-3 text-center text-sm">{item.gstRate}%</td>
                                    <td className="px-3 py-3 text-right text-sm">{formatCurrency(item.taxableAmount)}</td>
                                    <td className="px-3 py-3 text-right text-sm">{formatCurrency(item.gstAmount)}</td>
                                    <td className="px-3 py-3 text-right text-sm font-semibold">{formatCurrency(item.lineTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-96">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm border-b pb-2">
                                <span className="font-semibold text-gray-700">Subtotal:</span>
                                <span>{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.totalDiscount > 0 && (
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="font-semibold text-gray-700">Total Discount:</span>
                                    <span className="text-red-600">-{formatCurrency(invoice.totalDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm border-b pb-2">
                                <span className="font-semibold text-gray-700">Total GST:</span>
                                <span>{formatCurrency(invoice.totalGST)}</span>
                            </div>
                            {invoice.shipping > 0 && (
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="font-semibold text-gray-700">Shipping:</span>
                                    <span>{formatCurrency(invoice.shipping)}</span>
                                </div>
                            )}
                            {invoice.rounding !== 0 && (
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="font-semibold text-gray-700">Rounding:</span>
                                    <span>{invoice.rounding > 0 ? '+' : ''}{formatCurrency(invoice.rounding)}</span>
                                </div>
                            )}
                            <div className="bg-primary-600 text-white p-3 rounded-lg mt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Grand Total:</span>
                                    <span>{formatCurrency(invoice.grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 pt-6">
                    {invoice.paymentTerms && (
                        <div className="mb-4">
                            <div className="font-semibold text-gray-700 mb-1">Payment Terms</div>
                            <div className="text-gray-600">{invoice.paymentTerms}</div>
                        </div>
                    )}
                    {invoice.notes && (
                        <div className="mb-4">
                            <div className="font-semibold text-gray-700 mb-1">Notes</div>
                            <div className="text-gray-600">{invoice.notes}</div>
                        </div>
                    )}
                    <div className="text-center text-gray-500 text-sm mt-6 pt-4 border-t">
                        Thank you for your business!
                    </div>
                </div>
            </div>

            {/* Email Modal */}
            {emailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Email Invoice</h2>
                            <button
                                onClick={() => { setEmailModal(false); setError(''); setEmailSuccess(''); }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {emailSuccess && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {emailSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSendEmail}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    value={emailTo}
                                    onChange={(e) => setEmailTo(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => { setEmailModal(false); setError(''); setEmailSuccess(''); }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={emailSending}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {emailSending ? 'Sending...' : 'Send Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
