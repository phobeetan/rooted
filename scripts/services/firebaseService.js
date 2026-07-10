// Firebase service (modular) - lightweight wrapper
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { doc, setDoc, collection, query, where, getDocs, limit } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Firebase project configuration — replace placeholders removed, using provided config
const firebaseConfig = {
  apiKey: "AIzaSyAl8Cd6VZvEJ-pGMIO4-klZNpFk4sKCu8s",
  authDomain: "rooted-3f27f.firebaseapp.com",
  projectId: "rooted-3f27f",
  storageBucket: "rooted-3f27f.firebasestorage.app",
  messagingSenderId: "449409766401",
  appId: "1:449409766401:web:143db9e9119530c45a5c00",
  measurementId: "G-YZLB5ZHLXZ"
};

let auth = null;
let db = null;

/**
 * Initialize the service with Firebase instances
 * @param {import('firebase/auth').Auth} authInstance
 * @param {import('firebase/firestore').Firestore} dbInstance
 */
export function initializeFirebase(authInstance, dbInstance) {
  auth = authInstance;
  db = dbInstance;
}

/**
 * Create a new Firebase account
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} uid
 */
export async function createAccount(email, password) {
  if (!auth) throw new Error('Firebase auth not initialized');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}

/**
 * Save user profile to Firestore under users collection
 * @param {string} uid
 * @param {Object} profileData
 * @returns {Promise<void>}
 */
export async function saveUserProfile(uid, profileData) {
  if (!db) throw new Error('Firestore not initialized');
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, profileData, { merge: true });
}

/**
 * Check whether an email exists in users collection
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function checkEmailExists(email) {
  if (!db) return false;
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('email', '==', email), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Sign in an existing user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} uid
 */
export async function signIn(email, password) {
  if (!auth) throw new Error('Firebase auth not initialized');
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}