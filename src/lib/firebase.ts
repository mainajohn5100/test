import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate the firebaseConfig object to ensure all keys have values
const isFirebaseConfigValid = Object.values(firebaseConfig).every(Boolean);

if (!isFirebaseConfigValid) {
    // This error will be thrown if any of the environment variables are missing.
    // It's more descriptive than the default Firebase error.
    throw new Error('Firebase configuration is missing or incomplete. Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.');
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
