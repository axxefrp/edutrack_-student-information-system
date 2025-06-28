import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4pNswgfUT_jOQDtdJ3qoJ7oZmcMcU3a0",
  authDomain: "edutrack-sis.firebaseapp.com",
  projectId: "edutrack-sis",
  storageBucket: "edutrack-sis.firebasestorage.app",
  messagingSenderId: "729998527249",
  appId: "1:729998527249:web:99576da4080eb5e4a51ab0",
  measurementId: "G-73YCMRF5KK"
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
