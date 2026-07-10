import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, setDoc, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

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

function authUserData(user) {
  return {
    uid: user.uid,
    email: user.email || '',
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.metadata?.creationTime || '',
    lastLoginAt: user.metadata?.lastSignInTime || '',
    providers: user.providerData?.map((provider) => provider.providerId) || [],
  };
}

export async function createAccount(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await syncUserProfile(userCredential.user);
  return userCredential.user;
}

export async function saveUserProfile(uid, profileData = {}) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { ...profileData, uid, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function syncUserProfile(user, profileData = {}) {
  const record = {
    ...profileData,
    ...authUserData(user),
    lastSeenAt: new Date().toISOString(),
  };
  await saveUserProfile(user.uid, record);
  return getUserProfile(user.uid);
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : {};
}

export async function checkEmailExists(email) {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('email', '==', email), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await syncUserProfile(userCredential.user);
  return userCredential.user;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function signOutUser() {
  return signOut(auth);
}
