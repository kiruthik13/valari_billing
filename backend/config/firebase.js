import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

let serviceAccount;

// Try to load from file first (local development)
try {
    const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json';
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ Loaded Firebase credentials from file');
} catch (error) {
    // Fallback to environment variable (production deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Loaded Firebase credentials from environment variable');
    } else {
        console.error('❌ Firebase initialization error:', error.message);
        throw new Error('Firebase credentials not found. Please set SERVICE_ACCOUNT_KEY_PATH or FIREBASE_SERVICE_ACCOUNT');
    }
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

console.log('✅ Firebase Admin SDK initialized successfully');

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
export { admin };
