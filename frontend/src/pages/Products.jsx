import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { fileToBase64, formatCurrency } from '../utils/helpers';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        unitPrice: '',
        gstRate: '',
        imageBase64: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setProducts(response.data);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size must be less than 2MB');
                return;
            }
            const base64 = await fileToBase64(file);
            setFormData({ ...formData, imageBase64: base64 });
            setImagePreview(base64);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct.id, {
                    ...formData,
                    unitPrice: parseFloat(formData.unitPrice),
                    gstRate: parseFloat(formData.gstRate)
                });
                setSuccess('Product updated successfully!');
            } else {
                await productsAPI.create({
                    ...formData,
                    unitPrice: parseFloat(formData.unitPrice),
                    gstRate: parseFloat(formData.gstRate)
                });
                setSuccess('Product created successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku || '',
            description: product.description || '',
            unitPrice: product.unitPrice,
            gstRate: product.gstRate,
            imageBase64: null
        });
        setImagePreview(product.imageUrl);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productsAPI.delete(id);
            setSuccess('Product deleted successfully!');
            fetchProducts();
        } catch (err) {
            setError('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sku: '',
            description: '',
            unitPrice: '',
            gstRate: '',
            imageBase64: null
        });
        setImagePreview(null);
        setEditingProduct(null);
    };

    if (loading) {
        return <div className="text-center py-12">Loading products...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                >
                    + Add Product
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="card hover:shadow-lg transition-shadow">
                        {product.imageUrl && (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {product.name}
                        </h3>
                        {product.sku && (
                            <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                        )}
                        {product.description && (
                            <p className="text-gray-600 mb-4">{product.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-2xl font-bold text-primary-600">
                                    {formatCurrency(product.unitPrice)}
                                </p>
                                <p className="text-sm text-gray-500">GST: {product.gstRate}%</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No products found. Create your first product!
                </div>
            )}

            {/* Add Product Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Add Product</h2>
                                    <button
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="input-field"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                SKU
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                className="input-field"
                                                rows="3"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Price (₹) *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    className="input-field"
                                                    value={formData.unitPrice}
                                                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    GST Rate (%) *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    className="input-field"
                                                    value={formData.gstRate}
                                                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product Image (Max 2MB)
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="input-field"
                                                onChange={handleImageChange}
                                            />
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => { setShowModal(false); resetForm(); }}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary">
                                            Create Product
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
