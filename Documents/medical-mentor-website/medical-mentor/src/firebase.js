import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com → Create project (it's free).
// 2. Inside the project: Build → Firestore Database → Create database
//    (start in "test mode" for now, lock it down later — see README).
// 3. Build → Authentication → Sign-in method → enable "Email/Password".
// 4. Authentication → Users → Add user → email: imrannazeert@gmail.com,
//    pick any password. That account is now the site admin.
// 5. Project settings (gear icon) → General → Your apps → Web app (</>)
//    → copy the config object it gives you and paste the values below.
// ─────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDFxkwxMzvkh9LQfCef5JKQDVbHLGT6MWg",
  authDomain: "medical-mentor-818c1.firebaseapp.com",
  projectId: "medical-mentor-818c1",
  storageBucket: "medical-mentor-818c1.firebasestorage.app",
  messagingSenderId: "125383842237",
  appId: "1:125383842237:web:7e2be865d790642e40dad4",
  measurementId: "G-1VMCRK4QPL",
};

// The site will still run and show mock/demo content even before you fill
// in real Firebase keys — admin login and live updates just won't work yet.
export const firebaseReady = firebaseConfig.apiKey !== "YOUR_API_KEY";

export const app = firebaseReady ? initializeApp(firebaseConfig) : null;
export const auth = firebaseReady ? getAuth(app) : null;
export const db = firebaseReady ? getFirestore(app) : null;

// Only this email is allowed to reach the admin panel.
export const ADMIN_EMAIL = "imrannazeert@gmail.com";
