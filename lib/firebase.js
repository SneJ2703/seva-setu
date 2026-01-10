// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAY6n-C6C8vUPwQoAXxTtyHz2up8zL1HYY",
  authDomain: "seva-setu-ecab2.firebaseapp.com",
  databaseURL: "https://seva-setu1-default-rtdb.firebaseio.com", // Realtime Database URL
  projectId: "seva-setu-ecab2",
  storageBucket: "seva-setu-ecab2.firebasestorage.app",
  messagingSenderId: "120338171898",
  appId: "1:120338171898:web:25b31e1d74aaab6bb68643",
  measurementId: "G-JVXMVPK95Q"
};

// Initialize Firebase (prevent re-initialization in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const database = getDatabase(app);

export { app, db, db as firestore, database };