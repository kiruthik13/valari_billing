# Valari Bill Generator

A production-ready Bill Generator + Calculator web application with React frontend and Node.js Express backend, using Firebase for data and file storage.

![Valari Logo](./backend/logo.png)

## Features

- ✅ **Product Management**: Create and manage products with images, prices, and GST rates
- ✅ **Invoice Builder**: Create professional invoices with line items, discounts, and GST calculations
- ✅ **PDF Generation**: Server-side PDF generation using Puppeteer with professional layout
- ✅ **Firebase Integration**: Firestore for data storage and Firebase Storage for files
- ✅ **Email Invoices**: Optional email delivery via Nodemailer (SMTP)
- ✅ **Real-time Calculations**: Live calculation of totals, discounts, and GST
- ✅ **Responsive UI**: Modern, clean interface built with React and Tailwind CSS
- ✅ **Unit Tests**: Jest tests for calculation logic

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js + Express
- Firebase Admin SDK (Firestore + Storage)
- Puppeteer (PDF generation)
- Nodemailer (Email)
- Jest (Testing)

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Storage enabled
- Firebase service account JSON key
- (Optional) SMTP credentials for email functionality

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database and Firebase Storage
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `backend/serviceAccountKey.json`

### 3. Backend Configuration

Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=4000
SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
INVOICE_API_KEY=your-secret-api-key
CURRENCY_SYMBOL=₹
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NODE_ENV=development
```

### 4. Frontend Configuration

Create `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_API_KEY=your-secret-api-key
```

**Note**: The `VITE_API_KEY` must match the `INVOICE_API_KEY` in backend `.env`

### 5. Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 4 sample products (Laptop X, Phone Y, Mouse Z, Service: Installation)
- 1 sample invoice with PDF

### 6. Run the Application

**Backend** (Terminal 1):
```bash
cd backend
npm start
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

Access the application at: [http://localhost:5173](http://localhost:5173)

## API Documentation

### Products

#### Create Product
```bash
POST /api/products
Headers: x-api-key: <INVOICE_API_KEY>
Body: {
  "name": "Product Name",
  "sku": "PROD-001",
  "description": "Product description",
  "unitPrice": 1000,
  "gstRate": 18,
  "imageBase64": "data:image/jpeg;base64,..."
}
```

#### Get All Products
```bash
GET /api/products
```

#### Get Product by ID
```bash
GET /api/products/:id
```

### Invoices

#### Create Invoice
```bash
POST /api/invoices
Headers: x-api-key: <INVOICE_API_KEY>
Body: {
  "companyDetails": {
    "name": "Company Name",
    "address": "Address",
    "phone": "Phone",
    "email": "email@example.com",
    "gstin": "GSTIN"
  },
  "customerDetails": {
    "name": "Customer Name",
    "address": "Address",
    "phone": "Phone",
    "email": "email@example.com"
  },
  "items": [
    {
      "name": "Product",
      "unitPrice": 1000,
      "gstRate": 18,
      "quantity": 2,
      "discountPercent": 5
    }
  ],
  "shipping": 100,
  "paymentTerms": "Net 15",
  "notes": "Thank you!"
}
```

#### Get Invoice
```bash
GET /api/invoices/:id
```

#### Download PDF
```bash
GET /api/invoices/:id/pdf
```

#### Email Invoice
```bash
POST /api/invoices/:id/email
Headers: x-api-key: <INVOICE_API_KEY>
Body: {
  "toEmail": "customer@example.com"
}
```

## Testing

Run unit tests for calculation logic:

```bash
cd backend
npm test
```

## Project Structure

```
Valari Bill Generator/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK setup
│   ├── middleware/
│   │   └── auth.js               # API key authentication
│   ├── routes/
│   │   ├── products.js           # Product CRUD endpoints
│   │   └── invoices.js           # Invoice endpoints
│   ├── services/
│   │   ├── pdfGenerator.js       # Puppeteer PDF generation
│   │   ├── invoiceTemplate.js    # HTML invoice template
│   │   └── emailService.js       # Nodemailer email service
│   ├── utils/
│   │   ├── calculations.js       # Invoice calculation logic
│   │   ├── validation.js         # Input validation
│   │   └── invoiceNumber.js      # Invoice number generator
│   ├── src/
│   │   └── seed.js               # Database seeding script
│   ├── tests/
│   │   └── calculations.test.js  # Jest unit tests
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Products.jsx      # Product management page
│   │   │   ├── InvoiceBuilder.jsx # Invoice creation page
│   │   │   └── InvoicePreview.jsx # Invoice preview/actions
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── utils/
│   │   │   └── helpers.js        # Utility functions
│   │   ├── App.jsx               # Main app component
│   │   └── index.css             # Tailwind CSS
│   ├── package.json
│   └── .env
└── README.md
```

## Company Details

This application is configured for:

**VALARI IYARKAI VELAN URPATHI MAIYAM**
- Address: 51-A, SORIYAMPALAYAM, VAZHAITHOTTAM (Po), SIVAGIRI - 638109, ERODE (Dt)
- Phone: 8056638446, 9976238446
- GSTIN: 33AFNPM8201K1ZB

## Migration Notes

### S3 Migration (Future)

To migrate from Firebase Storage to AWS S3:

1. Install AWS SDK: `npm install aws-sdk`
2. Update `backend/services/pdfGenerator.js` and `backend/routes/products.js`
3. Replace Firebase Storage upload calls with S3 upload
4. Update URLs to use S3 bucket URLs

### Production Authentication

For production deployment:

1. Implement Firebase Authentication in frontend
2. Send Firebase ID tokens in API requests
3. Replace API key middleware with Firebase token verification
4. Add Firestore security rules for user-based access control

## Troubleshooting

### Puppeteer Issues
If Puppeteer fails to install or run:
```bash
npm install puppeteer --ignore-scripts
```

### Firebase Permission Errors
Ensure your service account has:
- Firestore: Read/Write permissions
- Storage: Admin permissions

### Email Not Sending
- Verify SMTP credentials
- For Gmail, use an App Password (not your regular password)
- Check firewall/antivirus settings

## License

ISC

## Support

For issues or questions, please contact: valari@example.com
