# Deployment Guide

## 🚀 Live URLs

- **Frontend (Vercel)**: https://valari-billing.vercel.app/
- **Backend (Render)**: https://valari-billing.onrender.com

## Backend Deployment (Render)

### Initial Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `kiruthik13/valari_billing`
4. Configure:
   - **Name**: `valari-billing`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### Environment Variables
Add these in Render Dashboard → Environment:

```
PORT=4000
NODE_ENV=production
FIREBASE_STORAGE_BUCKET=valari-d9c7a.appspot.com
INVOICE_API_KEY=valari-secret-key-2024
CURRENCY_SYMBOL=₹
SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json
```

### Firebase Service Account
1. Download `serviceAccountKey.json` from Firebase Console
2. In Render, go to your service → "Environment" tab
3. Add as **Secret File**:
   - **Filename**: `serviceAccountKey.json`
   - **Contents**: Paste the entire JSON content

### SMTP (Optional - for email)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Frontend Deployment (Vercel)

### Initial Setup
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import `kiruthik13/valari_billing`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Environment Variables
Add in Vercel → Settings → Environment Variables:

```
VITE_API_URL=https://valari-billing.onrender.com
VITE_API_KEY=valari-secret-key-2024
```

## 🔄 Auto-Deploy

Both platforms auto-deploy when you push to GitHub:

```bash
git add .
git commit -m "your message"
git push origin main
```

## ⚠️ Important Notes

### Backend (Render)
- Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid plan for always-on service

### Frontend (Vercel)
- Deploys instantly on push
- Automatic HTTPS
- Global CDN

### Firebase Storage
**MUST enable Firebase Storage** for:
- Product images
- Invoice PDFs (optional, PDFs generate on-demand)

Enable at: https://console.firebase.google.com/project/valari-d9c7a/storage

## 🧪 Testing Deployment

1. **Frontend**: Visit https://valari-billing.vercel.app/
2. **Backend Health**: Visit https://valari-billing.onrender.com/
3. **Create Invoice**: Test full flow end-to-end

## 🐛 Troubleshooting

### Backend Issues
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set
- Ensure `serviceAccountKey.json` is uploaded

### Frontend Issues
- Check Vercel deployment logs
- Verify `VITE_API_URL` points to Render backend
- Check browser console for CORS errors

### CORS Issues
If frontend can't connect to backend, add to `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://valari-billing.vercel.app'
}));
```

## 📊 Monitoring

- **Render**: Dashboard shows CPU, memory, requests
- **Vercel**: Analytics tab shows page views, performance
- **Firebase**: Console shows Firestore reads/writes

## 💰 Cost Optimization

### Free Tier Limits
- **Render**: 750 hours/month (enough for 1 service)
- **Vercel**: Unlimited hobby projects
- **Firebase**: 50K reads, 20K writes per day

### Upgrade When
- Backend needs to be always-on
- More than 50K daily Firestore operations
- Need custom domain on Vercel
