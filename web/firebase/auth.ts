// Firebase Authentication utilities
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./client";

export const googleProvider = new GoogleAuthProvider();

/** Sign up with email and password */
export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Sign in with email and password */
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Sign in with Google popup */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/** Sign out current user */
export async function signOutUser() {
  return signOut(auth);
}

/** Send password reset email */
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/** Subscribe to auth state changes */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
