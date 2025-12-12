import { useState, useEffect } from 'react';
import { invoicesAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, id: null });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoicesAPI.getAll();
      setInvoices(response.data);
    } catch (err) {
      setToast({ message: 'Failed to load invoices', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id, invoiceNumber) => {
    try {
      const url = invoicesAPI.getPdfUrl(id);

      // Fetch the PDF as a blob
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setToast({ message: 'PDF downloaded successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to download PDF', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      id,
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
      type: 'danger'
    });
  };

  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      action: 'clearAll',
      title: 'Clear All Invoices',
      message: `This will permanently delete all ${invoices.length} invoices. This action cannot be undone!`,
      type: 'danger'
    });
  };

  const executeAction = async () => {
    try {
      if (confirmModal.action === 'delete') {
        await invoicesAPI.delete(confirmModal.id);
        setToast({ message: 'Invoice deleted successfully', type: 'success' });
      } else if (confirmModal.action === 'clearAll') {
        const response = await invoicesAPI.clearAll();
        setToast({ message: `Successfully cleared ${response.data.count} invoices`, type: 'success' });
      }
      fetchInvoices();
    } catch (err) {
      setToast({ message: 'Operation failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, id: null })}
        onConfirm={executeAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoice History</h1>
        {invoices.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All History
          </button>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices yet</h3>
          <p className="text-gray-500">Create your first invoice to get started</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {invoice.customerDetails.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-primary-600">
                      {formatCurrency(invoice.grandTotal)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {invoice.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => window.location.href = `/invoices/${invoice.id}`}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(invoice.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
