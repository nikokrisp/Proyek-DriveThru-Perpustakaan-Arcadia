import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace these with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAbNglODIb3qnl58e6WDNPis2XCtyIm59Y",
  authDomain: "dtarcadia-db.firebaseapp.com",
  projectId: "dtarcadia-db",
  storageBucket: "dtarcadia-db.firebasestorage.app",
  messagingSenderId: "454609113186",
  appId: "1:454609113186:web:0b1d22e10f6af1cb8a813b",
  measurementId: "G-89F2VHDNLL"
};

// Initialize Firebase only if not already initialized
let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase services
// Auth requires Email/Password provider to be enabled in Firebase Console
const auth = getAuth(app);
auth.languageCode = 'en';

const db = getFirestore(app);
const storage = getStorage(app);

// Export them
export { auth, db, storage };
export default app;
