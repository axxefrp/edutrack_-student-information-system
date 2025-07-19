// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4pNswgfUT_jOQDtdJ3qoJ7oZmcMcU3a0",
  authDomain: "edutrack-sis.firebaseapp.com",
  projectId: "edutrack-sis",
  storageBucket: "edutrack-sis.firebasestorage.app",
  messagingSenderId: "729998527249",
  appId: "1:729998527249:web:99576da4080eb5e4a51ab0",
  measurementId: "G-73YCMRF5KK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
 