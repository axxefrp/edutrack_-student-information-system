// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC4pNswgfUT_jOQDtdJ3qoJ7oZmcMcU3a0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edutrack-sis.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edutrack-sis",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edutrack-sis.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "729998527249",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:729998527249:web:99576da4080eb5e4a51ab0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-73YCMRF5KK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
 