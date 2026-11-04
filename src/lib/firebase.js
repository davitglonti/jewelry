// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || "").trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || "").trim(),
};

let app = null;
let db = null;
let auth = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
    // შენიშვნა: auth ინიციალიზდება lazy-რეჟიმში (getLazyAuth), რათა კრიტიკულ path-ზე
    // 93 KiB iframe-ის ჩამოტვირთვამ საიტის საწყისი ჩატვირთვა არ შეაფერხოს.
  }
} catch (err) {
  console.warn("Firebase ინიციალიზაციის შეცდომა:", err);
}

export const getLazyAuth = async () => {
  if (auth) return auth;
  if (!app) return null;
  try {
    const { getAuth } = await import("firebase/auth");
    auth = getAuth(app);
  } catch (err) {
    console.warn("Firebase Auth lazy loading error:", err);
  }
  return auth;
};

export const setAuthInstance = (instance) => {
  auth = instance;
};

export { app, db, auth };
