import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB4jLlw1zGyYBrmoQyhNdq3l2znvEbzvME",
    authDomain: "software-architecture-505f8.firebaseapp.com",
    projectId: "software-architecture-505f8",
    storageBucket: "software-architecture-505f8.firebasestorage.app",
    messagingSenderId: "542503151859",
    appId: "1:542503151859:web:1703d69a54674fc8492f86"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);