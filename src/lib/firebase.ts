
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

// --- Debugging Helper ---
// This will log the loaded config values to the server console when the app starts.
// It helps verify that the .env file is being read correctly.
console.log("--- Firebase Config Debug ---");
console.log("Project ID loaded:", firebaseConfig.projectId || "NOT FOUND");
const apiKey = firebaseConfig.apiKey;
if (apiKey) {
    console.log("API Key loaded: Yes (length:", apiKey.length, ")");
} else {
    console.log("API Key loaded: No (value is undefined or empty)");
}
console.log("---------------------------");


// Initialize Firebase
// The config check is handled by the UI now to provide better error messages.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
