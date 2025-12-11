# 🔥 Render Deployment - Firebase Setup

## Problem
Render shows: `ENOENT: no such file or directory, open './serviceAccountKey.json'`

## Solution: Add Firebase Credentials to Render

### Option 1: Environment Variable (Recommended)

1. **Get your Firebase Service Account JSON:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/valari-d9c7a/settings/serviceaccounts/adminsdk)
   - Click "Generate new private key"
   - Download the JSON file
   - Open it and copy the ENTIRE contents

2. **Add to Render:**
   - Go to your Render service dashboard
   - Click "Environment" tab
   - Add new environment variable:
     - **Key**: `FIREBASE_SERVICE_ACCOUNT`
     - **Value**: Paste the entire JSON content (including `{` and `}`)
   - Click "Save Changes"

3. **Redeploy:**
   - Render will automatically redeploy
   - Or click "Manual Deploy" → "Deploy latest commit"

### Option 2: Secret File

1. **In Render Dashboard:**
   - Go to "Environment" tab
   - Scroll to "Secret Files" section
   - Click "Add Secret File"
   - **Filename**: `serviceAccountKey.json`
   - **Contents**: Paste your entire Firebase service account JSON
   - Click "Save"

2. **Redeploy**

## Required Environment Variables in Render

Make sure these are ALL set in Render → Environment:

```
PORT=4000
NODE_ENV=production
FIREBASE_STORAGE_BUCKET=valari-d9c7a.appspot.com
FIREBASE_SERVICE_ACCOUNT=<your-entire-json-here>
INVOICE_API_KEY=valari-secret-key-2024
CURRENCY_SYMBOL=₹
```

## Verify Deployment

After setting the environment variable:
1. Check Render logs for: `✅ Loaded Firebase credentials from environment variable`
2. Visit: https://valari-billing.onrender.com
3. Should see: "Valari Bill Generator API is running"

## ⚠️ Important

- **DO NOT** commit `serviceAccountKey.json` to GitHub
- Use environment variable for production
- Keep the file for local development only
