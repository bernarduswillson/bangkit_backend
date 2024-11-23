import { Firestore } from '@google-cloud/firestore';
import process from 'process';

// Initialize Firestore
export const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: (process.env.GOOGLE_CLOUD_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  databaseId: 'bangkit-db'
});