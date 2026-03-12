import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// REPLACE THESE WITH YOUR ACTUAL VALUES FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyDjTjatl8l8VwbEWg0EKTW2FWnHa8OgVHs",
  authDomain: "church-engagement-platform.firebaseapp.com",
  projectId: "church-engagement-platform",
  storageBucket: "church-engagement-platform.firebasestorage.app",
  messagingSenderId: "780356242259",
  appId: "1:780356242259:web:3d7b94f965fe1d373b6fa6"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;