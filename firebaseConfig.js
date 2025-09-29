import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD106Y2G0g9sVQBjjmXXRicLaQpSGIGA_Q",
  authDomain: "fruitbunch-f1f23.firebaseapp.com",
  projectId: "fruitbunch-f1f23",
  storageBucket: "fruitbunch-f1f23.firebasestorage.app",
  messagingSenderId: "794545150234",
  appId: "1:794545150234:web:69f9820a661e0750ce34a3",
  measurementId: "G-JNY3T9LHLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);