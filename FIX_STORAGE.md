# 🔧 Quick Fix for PDF Generation

## ✅ What I Fixed
Updated the Firebase Storage bucket name from `valari-d9c7a.firebasestorage.app` to `valari-d9c7a.appspot.com` in the backend `.env` file.

## 🚨 Action Required: Enable Firebase Storage

The error "The specified bucket does not exist" means Firebase Storage isn't enabled yet.

### Step 1: Enable Firebase Storage (2 minutes)

1. **Open this link:**
   👉 https://console.firebase.google.com/project/valari-d9c7a/storage

2. Click **"Get started"**

3. Select **"Start in production mode"**

4. Click **"Done"**

### Step 2: Set Storage Rules

1. Click the **"Rules"** tab

2. Replace with this:
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

3. Click **"Publish"**

### Step 3: Restart Backend

Stop the current backend (Ctrl+C) and restart:

```bash
cd backend
npm start
```

### Step 4: Test Invoice Creation

Now try creating an invoice from the frontend:
1. Go to http://localhost:5173
2. Click "New Invoice"
3. Fill in customer details
4. Add some products
5. Click "Save & Generate PDF"

The PDF should generate successfully with the Valari logo!

## 📝 What Will Work After This

- ✅ Product images upload to Storage
- ✅ Invoice PDFs generate with company logo
- ✅ PDFs stored in Firebase Storage
- ✅ Download PDF button works
- ✅ Email invoice with PDF attachment (if SMTP configured)

## 🎯 Current Status

- Frontend: Running on http://localhost:5173
- Backend: Running on http://localhost:4000 (restart needed)
- Database: 4 products already in Firestore
- Storage: **Needs to be enabled** (follow steps above)
