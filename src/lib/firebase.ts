import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYWF0gfVsEVyO6JvbMz7QcMRFn_Mybfug",
  authDomain: "studio-4039228395-7a153.firebaseapp.com",
  projectId: "studio-4039228395-7a153",
  storageBucket: "studio-4039228395-7a153.firebasestorage.app",
  messagingSenderId: "88482599325",
  appId: "1:88482599325:web:92040b833365e779185f74"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
