import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbvMQKUWnQfni4qqEhG8Tz-wHzE815wCk",
  authDomain: "careervo-777.firebaseapp.com",
  projectId: "careervo-777",
  storageBucket: "careervo-777.firebasestorage.app",
  messagingSenderId: "741400245956",
  appId: "1:741400245956:web:ac4ab41b5db0f377ce3b91",
  measurementId: "G-0Z08EWCP9K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
