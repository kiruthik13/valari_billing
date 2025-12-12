# PDF Generation Solutions for Render

## ❌ Problem
Render's free tier has a **read-only file system** - you cannot install Chromium via `apt-get`.

Error: `E: List directory /var/lib/apt/lists/partial is missing. - Acquire (30: Read-only file system)`

## ✅ Solutions

### Option 1: Use Render Docker Deploy (Recommended)

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:18-slim

# Install Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
```

Then in Render:
1. Delete current service
2. Create new **Web Service**
3. Select **Docker** as environment
4. Render will use the Dockerfile

### Option 2: Use Chrome-AWS-Lambda (Easiest)

Install a package that bundles Chrome:

```bash
npm install chrome-aws-lambda puppeteer-core
```

Update `backend/services/pdfGenerator.js`:

```javascript
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export async function generateInvoicePdf(invoiceData) {
    let browser;
    try {
        const html = renderInvoiceHtml(invoiceData);

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        if (browser) await browser.close();
        console.error('PDF generation error:', error);
        throw error;
    }
}
```

### Option 3: Use PDF API Service (Production Ready)

Use a third-party service (paid but reliable):

**PDFShift** (https://pdfshift.io):
```javascript
import axios from 'axios';

export async function generateInvoicePdf(invoiceData) {
    const html = renderInvoiceHtml(invoiceData);
    
    const response = await axios.post('https://api.pdfshift.io/v3/convert/pdf', {
        source: html,
        format: 'A4'
    }, {
        auth: {
            username: 'api',
            password: process.env.PDFSHIFT_API_KEY
        },
        responseType: 'arraybuffer'
    });
    
    return Buffer.from(response.data);
}
```

### Option 4: Upgrade Render Plan

Upgrade to Render's **Standard plan** ($7/month) which allows Docker deployments with full system access.

## 🎯 Recommended Approach

**For now: Use Option 2 (chrome-aws-lambda)**

It's free, works on Render's free tier, and requires minimal code changes.

I can implement this for you if you'd like!
