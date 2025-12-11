import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Products from './pages/Products';
import InvoiceBuilder from './pages/InvoiceBuilder';
import InvoicePreview from './pages/InvoicePreview';
import InvoiceHistory from './pages/InvoiceHistory';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-primary-600">
                    VALARI
                  </div>
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Link
                    to="/products"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Products
                  </Link>
                  <Link
                    to="/invoices/new"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    New Invoice
                  </Link>
                  <Link
                    to="/invoices"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Invoice History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/invoices" element={<InvoiceHistory />} />
            <Route path="/invoices/new" element={<InvoiceBuilder />} />
            <Route path="/invoices/:id" element={<InvoicePreview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Valari Bill Generator
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Professional invoice management system
      </p>
      <div className="flex justify-center space-x-4">
        <Link to="/products" className="btn-primary">
          Manage Products
        </Link>
        <Link to="/invoices/new" className="btn-primary">
          Create Invoice
        </Link>
        <Link to="/invoices" className="btn-secondary">
          View History
        </Link>
      </div>
    </div>
  );
}

export default App;
