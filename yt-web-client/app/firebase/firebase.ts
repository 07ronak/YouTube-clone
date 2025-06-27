// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User, //interface
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAivv5XxZX1x_Fmy5M68LfTJk1q2SkmSN0",
  authDomain: "yt-clone-ronak.firebaseapp.com",
  projectId: "yt-clone-ronak",
  appId: "1:368875372157:web:c60dac96bb0c9e2d153b14",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Auth
const auth = getAuth(app);

export const functions = getFunctions();


//Creating wrapper function to prevent expose variables 
/**
 * Signs in the user with Google using a popup.
 * @returns A promise that resolves with the user's credentials.
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs out the current user.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOutUser() {
  return auth.signOut();
}

/**
 * Trigger a callback when the authentication state changes.
 * @returns A function to unsubscribe callback
 */
export function onAuthStateChanedHelper(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
