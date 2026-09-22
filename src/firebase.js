// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2H4pp9iRCFu5AcoXY9gfEdqv4Nz5v95Y",
  authDomain: "trelloclonebeehyv.firebaseapp.com",
  projectId: "trelloclonebeehyv",
  storageBucket: "trelloclonebeehyv.firebasestorage.app",
  messagingSenderId: "743714490696",
  appId: "1:743714490696:web:722110dd101dc49031cb7d",
  measurementId: "G-GZ2GDLYRZB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
