import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate env vars and log issues
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const storageBucket = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.REACT_APP_FIREBASE_APP_ID;

if (!apiKey || !projectId) {
  console.error('🚨 Firebase config missing! Check .env file:');
  console.error('- Copy .env.example to .env');
  console.error('- Fill REACT_APP_FIREBASE_* from Firebase Console > Project Settings');
  console.error('- Restart dev server (npm start)');
  console.error('Using demo mode - auth will fail!');
}

const firebaseConfig = {
  apiKey: apiKey || 'demo-missing',
  authDomain: authDomain || 'demo.firebaseapp.com',
  projectId: projectId || 'demo-project',
  storageBucket: storageBucket || 'demo.appspot.com',
  messagingSenderId: messagingSenderId || '123',
  appId: appId || 'demo-app'
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase init failed:', error.message);
  throw error;
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;