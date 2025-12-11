# Quick Setup Checklist for Valari Bill Generator

## ✅ Already Done
- [x] Frontend installed and running on http://localhost:5173
- [x] Backend code created
- [x] Frontend `.env` configured

## 🔴 Required Now

### 1. Get Firebase Service Account Key (5 minutes)

**Step 1:** Open this link in your browser:
👉 **https://console.firebase.google.com/project/valari-d9c7a/settings/serviceaccounts/adminsdk**

**Step 2:** Click the **"Generate new private key"** button

**Step 3:** Click **"Generate key"** in the confirmation dialog

**Step 4:** A JSON file will download. Rename it to `serviceAccountKey.json`

**Step 5:** Move the file to:
```
c:\Valari Bill Generator\backend\serviceAccountKey.json
```

### 2. Create Backend .env File

Create a new file: `c:\Valari Bill Generator\backend\.env`

Copy and paste this content:
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

**Note:** You can leave SMTP settings as-is for now (email will be optional).

### 3. Enable Firestore Database

**Step 1:** Open: https://console.firebase.google.com/project/valari-d9c7a/firestore

**Step 2:** Click **"Create database"**

**Step 3:** Select **"Start in production mode"**

**Step 4:** Choose location (select closest to India, e.g., `asia-south1`)

**Step 5:** Click **"Enable"**

### 4. Enable Firebase Storage

**Step 1:** Open: https://console.firebase.google.com/project/valari-d9c7a/storage

**Step 2:** Click **"Get started"**

**Step 3:** Select **"Start in production mode"**

**Step 4:** Use default location

**Step 5:** Click **"Done"**

### 5. Update Storage Rules

**Step 1:** In Storage, click the **"Rules"** tab

**Step 2:** Replace the rules with:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**Step 3:** Click **"Publish"**

## 🚀 After Setup - Run These Commands

Once you have the `serviceAccountKey.json` file and `.env` created:

```bash
# In the backend terminal (or new terminal):
cd "c:\Valari Bill Generator\backend"
npm install
npm run seed
npm start
```

The seed script will create:
- 4 sample products (Laptop X, Phone Y, Mouse Z, Installation Service)
- 1 sample invoice with PDF

## 🎯 Access Your App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000

## ❓ Need Help?

If you get stuck, let me know at which step and I'll help you troubleshoot!
