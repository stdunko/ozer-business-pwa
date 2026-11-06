import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYd27lnVRGyvHng5jpmZX9sCEpEOBIOSs",
  authDomain: "ozer-4fb1e.firebaseapp.com",
  projectId: "ozer-4fb1e",
  storageBucket: "ozer-4fb1e.firebasestorage.app",
  messagingSenderId: "685114373892",
  appId: "1:685114373892:web:8c0f79a0ceea37e2ef4251",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
})();

export { db };
