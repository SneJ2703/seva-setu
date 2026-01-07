// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAY6n-C6C8vUPwQoAXxTtyHz2up8zL1HYY",
  authDomain: "seva-setu-ecab2.firebaseapp.com",
  projectId: "seva-setu-ecab2",
  storageBucket: "seva-setu-ecab2.firebasestorage.app",
  messagingSenderId: "120338171898",
  appId: "1:120338171898:web:25b31e1d74aaab6bb68643",
  measurementId: "G-JVXMVPK95Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}