import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

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

// Analytics uses client-side document/window, only initialize if window is defined
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics, db };
