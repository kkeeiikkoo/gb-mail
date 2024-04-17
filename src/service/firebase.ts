import { firebaseConfig } from "./api";
// Firebase v9+ modular SDK syntax
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
