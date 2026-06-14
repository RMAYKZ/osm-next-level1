// Firebase'i sadece gerektiğinde (lazy) yükler.
// Bu sayede ana sayfa açılışında büyük Firebase SDK indirilmez ve site hızlı açılır.

import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";
import type { Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCy3W3-6LnKATmZCSEvBUmRyIm9QnrGJ2s",
  authDomain: "omerovvvvv.firebaseapp.com",
  projectId: "omerovvvvv",
  storageBucket: "omerovvvvv.firebasestorage.app",
  messagingSenderId: "999447374958",
  appId: "1:999447374958:web:1738563575981ae4354a7f",
  measurementId: "G-HS6Z02VP0V",
};

let appPromise: Promise<FirebaseApp> | null = null;

async function getApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = import("firebase/app").then(({ initializeApp }) => initializeApp(firebaseConfig));
  }
  return appPromise;
}

export async function getDb(): Promise<Firestore> {
  const [{ getFirestore }, app] = await Promise.all([import("firebase/firestore"), getApp()]);
  return getFirestore(app);
}

export async function getAuthInstance(): Promise<Auth> {
  const [{ getAuth }, app] = await Promise.all([import("firebase/auth"), getApp()]);
  return getAuth(app);
}

// Singleton — connectFunctionsEmulator must only be called once per instance.
let functionsInstance: Functions | null = null;

export async function getFunctionsInstance(): Promise<Functions> {
  if (functionsInstance) return functionsInstance;
  const [{ getFunctions, connectFunctionsEmulator }, app] = await Promise.all([
    import("firebase/functions"),
    getApp(),
  ]);
  functionsInstance = getFunctions(app, "europe-west1");
  // Set VITE_USE_EMULATOR=true in .env.local to route calls to the local
  // Functions emulator (firebase emulators:start --only functions).
  if (import.meta.env.VITE_USE_EMULATOR === "true") {
    connectFunctionsEmulator(functionsInstance, "127.0.0.1", 5001);
  }
  return functionsInstance;
}
