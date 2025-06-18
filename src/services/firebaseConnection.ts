import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARMd46l0pIBMurHHvtV-vVUxcePOP3HCA",
  authDomain: "aluapdev.firebaseapp.com",
  projectId: "aluapdev",
  storageBucket: "aluapdev.firebasestorage.app",
  messagingSenderId: "55665336780",
  appId: "1:55665336780:web:34fb46c8f3f7b9f6a37d69"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);


export { db, auth };