import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { collection, doc, getDocs, getFirestore, limit, query, setDoc, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAl8Cd6VZvEJ-pGMIO4-klZNpFk4sKCu8s",
  authDomain: "rooted-3f27f.firebaseapp.com",
  projectId: "rooted-3f27f",
  storageBucket: "rooted-3f27f.firebasestorage.app",
  messagingSenderId: "449409766401",
  appId: "1:449409766401:web:143db9e9119530c45a5c00",
  measurementId: "G-YZLB5ZHLXZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function createAccount(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}

export async function saveUserProfile(uid, profileData) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, profileData, { merge: true });
}

export async function checkEmailExists(email) {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('email', '==', email), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}
