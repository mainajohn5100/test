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

// A more robust validation check that identifies exactly which keys are missing or invalid.
const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value || typeof value !== 'string' || value.trim() === '')
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
    // This will throw a very specific error, making it much easier to debug.
    throw new Error(`Firebase configuration is missing or incomplete. 
    Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set correctly.
    Missing or invalid keys: ${missingConfigKeys.join(', ')}.
    Remember to restart your development server after editing the .env file.`);
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
