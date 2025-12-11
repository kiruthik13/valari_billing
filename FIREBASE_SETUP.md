# Firebase Setup Instructions for Valari Bill Generator

## What You Have
You've provided the **client-side Firebase config**, which is great! I can see your project details:
- Project ID: `valari-d9c7a`
- Storage Bucket: `valari-d9c7a.firebasestorage.app`

## What You Need
The backend requires a **Firebase Admin SDK Service Account Key** (a JSON file) to access Firestore and Storage securely.

## Steps to Get Your Service Account Key

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/valari-d9c7a/settings/serviceaccounts/adminsdk

### 2. Generate New Private Key
1. You'll see a page titled "Service accounts"
2. Click the **"Generate new private key"** button
3. A dialog will appear - click **"Generate key"**
4. A JSON file will download automatically (e.g., `valari-d9c7a-firebase-adminsdk-xxxxx.json`)

### 3. Save the File
1. Rename the downloaded file to: `serviceAccountKey.json`
2. Move it to: `c:\Valari Bill Generator\backend\serviceAccountKey.json`

**IMPORTANT:** This file contains sensitive credentials. Never commit it to Git (it's already in .gitignore).

### 4. Enable Firestore and Storage
Make sure these are enabled in your Firebase project:

**Firestore:**
1. Go to: https://console.firebase.google.com/project/valari-d9c7a/firestore
2. Click "Create database"
3. Choose "Start in production mode" (we'll add rules later)
4. Select a location (choose closest to your users)

**Storage:**
1. Go to: https://console.firebase.google.com/project/valari-d9c7a/storage
2. Click "Get started"
3. Choose "Start in production mode"
4. Use default location

### 5. Update Storage Rules (Important!)
Go to Storage Rules and replace with:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Public read for invoice PDFs and product images
      allow write: if false; // Only backend can write via Admin SDK
    }
  }
}
```

## Backend Environment Setup

I've already configured your backend to use:
- Storage Bucket: `valari-d9c7a.firebasestorage.app`
- API Key: `valari-secret-key-2024`

You need to create `backend/.env` file manually with:

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

## Optional: Email Setup (Gmail)

If you want to send invoices via email:

1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
4. Update `SMTP_USER` and `SMTP_PASS` in `.env`

## Next Steps

Once you have the `serviceAccountKey.json` file:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Run seed script to create sample data
npm run seed

# 3. Start backend server
npm start

# In another terminal:
# 4. Install frontend dependencies
cd frontend
npm install

# 5. Start frontend
npm run dev
```

## Verification

After setup, you should see:
- Backend: `🚀 Valari Bill Generator API running on port 4000`
- Frontend: `http://localhost:5173`
- Seed script creates 4 products and 1 sample invoice with PDF

## Need Help?

If you encounter any errors:
1. Check that `serviceAccountKey.json` is in the correct location
2. Verify Firestore and Storage are enabled
3. Ensure `.env` file has correct values
4. Check Node.js version (need 18+)

Let me know if you need assistance with any step!
