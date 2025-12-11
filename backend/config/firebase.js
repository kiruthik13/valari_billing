import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let db, bucket;

try {
    const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json';
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    db = admin.firestore();
    bucket = admin.storage().bucket();

    console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    process.exit(1);
}

export { db, bucket, admin };
