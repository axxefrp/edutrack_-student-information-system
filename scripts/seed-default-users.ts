import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  { email: 'admin@edutrack.com', password: 'admin123', role: 'ADMIN' },
  { email: 'teacher@edutrack.com', password: 'teacher123', role: 'TEACHER' },
  { email: 'student@edutrack.com', password: 'student123', role: 'STUDENT' },
];

async function seedUsers() {
  for (const user of users) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        username: user.email.split('@')[0],
        email: user.email,
        role: user.role,
      });
      console.log(`Created user: ${user.email} (${user.role})`);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error creating user ${user.email}:`, e);
      }
    }
  }
  process.exit(0);
}

seedUsers();
