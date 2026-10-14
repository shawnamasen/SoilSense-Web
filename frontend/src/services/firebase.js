import { initializeApp } from 'firebase/app';
import { initializeAuth, browserSessionPersistence, browserPopupRedirectResolver, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
export const firebaseConfigured = requiredKeys.every(key => Boolean(firebaseConfig[key]));
let firebaseApp = null;
let auth = null;
let db = null;
let googleProvider = null;
if (firebaseConfigured) {
  firebaseApp = initializeApp(firebaseConfig);
  // Browser-tab session persistence retains approved admin sign-in across page refresh.
  // A closed tab loses the session; logout removes it immediately.
  auth = initializeAuth(firebaseApp, {
    persistence: browserSessionPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  db = getFirestore(firebaseApp);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} else {
  // The login form shows a friendly error if Firebase is unavailable.
}
export { firebaseApp, auth, db, googleProvider };
