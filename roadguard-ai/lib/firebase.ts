import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDq_d4KJWeE3ifjQjwjvMRfgbULII9mpTY",
  authDomain: "helmet-detection-7e07f.firebaseapp.com",
  projectId: "helmet-detection-7e07f",
  storageBucket: "helmet-detection-7e07f.firebasestorage.app",
  messagingSenderId: "869172469005",
  appId: "1:869172469005:web:c27f953be49fc648d9a444",
  measurementId: "G-0GLX8N1W1C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
