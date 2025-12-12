# Render Puppeteer Fix

## Problem
PDF generation fails on Render with error: `{"error":"Failed to generate PDF"}`

## Root Cause
Puppeteer requires Chromium and system dependencies that aren't installed by default on Render.

## Solution

### Option 1: Use Render Blueprint (render.yaml)
I've created `render.yaml` with all required dependencies. 

**To use it:**
1. Push the code to GitHub
2. In Render dashboard, delete the current service
3. Click "New" → "Blueprint"
4. Select your repository
5. Render will detect `render.yaml` and install everything

### Option 2: Manual Configuration (Simpler)

**In Render Dashboard:**

1. Go to your service → "Environment" tab
2. Add these environment variables:
   ```
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   ```

3. Go to "Settings" → "Build & Deploy"
4. Update **Build Command** to:
   ```bash
   npm install && apt-get update && apt-get install -y chromium chromium-sandbox
   ```

5. Click "Save Changes" and redeploy

### Option 3: Use Docker (Most Reliable)

If the above don't work, Render may need a Docker deployment with a proper Chromium image.

## Quick Test
After deploying, check Render logs for:
- `✅ Loaded Firebase credentials`
- No Puppeteer errors

Then test PDF download from your app.

## Alternative: Use a PDF Service
If Puppeteer continues to fail, consider:
- PDFShift API
- DocRaptor
- HTML2PDF services

These are paid but more reliable for production.
