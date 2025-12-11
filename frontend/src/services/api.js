import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_KEY = import.meta.env.VITE_API_KEY || 'change-me';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Products API
export const productsAPI = {
    getAll: () => api.get('/api/products'),
    getById: (id) => api.get(`/api/products/${id}`),
    create: (data) => api.post('/api/products', data, {
        headers: { 'x-api-key': API_KEY }
    }),
    update: (id, data) => api.put(`/api/products/${id}`, data, {
        headers: { 'x-api-key': API_KEY }
    }),
    delete: (id) => api.delete(`/api/products/${id}`, {
        headers: { 'x-api-key': API_KEY }
    })
};

// Invoices API
export const invoicesAPI = {
    getAll: () => api.get('/api/invoices'),
    create: (data) => api.post('/api/invoices', data, {
        headers: { 'x-api-key': API_KEY }
    }),
    getById: (id) => api.get(`/api/invoices/${id}`),
    getPdfUrl: (id) => `${API_URL}/api/invoices/${id}/pdf`,
    sendEmail: (id, toEmail) => api.post(`/api/invoices/${id}/email`,
        { toEmail },
        { headers: { 'x-api-key': API_KEY } }
    ),
    delete: (id) => api.delete(`/api/invoices/${id}`, {
        headers: { 'x-api-key': API_KEY }
    }),
    clearAll: () => api.delete('/api/invoices', {
        headers: { 'x-api-key': API_KEY }
    })
};

export default api;
