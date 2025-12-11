# ✅ Puppeteer Issue Fixed!

The Puppeteer compatibility issue with Node.js v22 has been resolved by updating to Puppeteer v23.0.0.

## 🔴 Before Running Seed Script

You need **2 files** in the `backend` folder:

### 1. `serviceAccountKey.json` (Firebase Admin SDK Key)

**Get it here:** https://console.firebase.google.com/project/valari-d9c7a/settings/serviceaccounts/adminsdk

Steps:
1. Click "Generate new private key"
2. Download the JSON file
3. Rename to `serviceAccountKey.json`
4. Place in: `c:\Valari Bill Generator\backend\serviceAccountKey.json`

### 2. `.env` (Environment Configuration)

Create file: `c:\Valari Bill Generator\backend\.env`

Content:
```env
PORT=4000
SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=valari-d9c7a.firebasestorage.app
INVOICE_API_KEY=valari-secret-key-2024
CURRENCY_SYMBOL=₹
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NODE_ENV=development
```

## 🚀 Then Run

```bash
cd backend
npm run seed
npm start
```

## ✅ What Will Happen

The seed script will create:
- 4 sample products (Laptop X, Phone Y, Mouse Z, Installation Service)
- 1 sample invoice with PDF
- All data stored in Firebase Firestore
- PDFs stored in Firebase Storage

## 📝 Note

Make sure Firestore and Storage are enabled in your Firebase project:
- Firestore: https://console.firebase.google.com/project/valari-d9c7a/firestore
- Storage: https://console.firebase.google.com/project/valari-d9c7a/storage
