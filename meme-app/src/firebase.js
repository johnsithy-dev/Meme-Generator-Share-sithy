// Firebase setup.
// This version does NOT use Firebase Storage (it now requires the paid
// Blaze plan). Meme images are saved directly inside Firestore documents,
// which stays free on the Spark plan.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const MAX_IMAGE_BYTES = 900_000;

// ---------------- AUTH ----------------
export async function resendVerificationEmail() {
  if (auth.currentUser) {
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      await auth.currentUser.getIdToken(true);
      return { alreadyVerified: true };
    }
    await sendEmailVerification(auth.currentUser);
    return { alreadyVerified: false };
  }
}

export async function registerUser({ email, password, displayName }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    displayName: displayName || email.split('@')[0],
    bio: '',
    role: 'user',
    photoURL: null,
    createdAt: serverTimestamp(),
  });
  return cred.user;
}
export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateProfilePicture(uid, dataUrl) {
  if (dataUrl.length > 400_000) {
    throw new Error('Image is too large. Try a smaller photo.');
  }
  await updateDoc(doc(db, 'users', uid), { photoURL: dataUrl });
}
export async function updateUserProfile(uid, { displayName, bio }) {
  const patch = {};
  if (displayName !== undefined) patch.displayName = displayName;
  if (bio !== undefined) patch.bio = bio;
  await updateDoc(doc(db, 'users', uid), patch);
}

// ---------------- MEMES (CRUD) ----------------

export async function postMeme({ dataUrl, title, captionText, author, authorId }) {
  if (dataUrl.length > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Try a smaller source image.');
  }
  await addDoc(collection(db, 'memes'), {
    imageUrl: dataUrl,
    title: title || '',
    captionText: captionText || '',
    author: author || 'anonymous',
    authorId: authorId || null,
    likedBy: [],
    createdAt: serverTimestamp(),
  });
}

export async function fetchMemes() {
  const q = query(collection(db, 'memes'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchMemesByUser(uid) {
  const q = query(collection(db, 'memes'), where('authorId', '==', uid));
  const snapshot = await getDocs(q);
  const memes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  memes.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return memes;
}

export async function updateMeme(memeId, { title }) {
  await updateDoc(doc(db, 'memes', memeId), { title });
}

export async function deleteMeme(memeId) {
  await deleteDoc(doc(db, 'memes', memeId));
}

export async function toggleLike(memeId, uid, isLiked) {
  const memeRef = doc(db, 'memes', memeId);
  await updateDoc(memeRef, {
    likedBy: isLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
}

// ---------------- COMMENTS ----------------

export async function addComment(memeId, { text, author, authorId, parentId }) {
  await addDoc(collection(db, 'memes', memeId, 'comments'), {
    text,
    author: author || 'anonymous',
    authorId,
    parentId: parentId || null,
    likedBy: [],
    createdAt: serverTimestamp(),
  });
}
export async function toggleCommentLike(memeId, commentId, uid, isLiked) {
  const commentRef = doc(db, 'memes', memeId, 'comments', commentId);
  await updateDoc(commentRef, {
    likedBy: isLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
}

export async function fetchComments(memeId) {
  const q = query(collection(db, 'memes', memeId, 'comments'), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteComment(memeId, commentId) {
  await deleteDoc(doc(db, 'memes', memeId, 'comments', commentId));
}
// ---------------- CONTACT MESSAGES ----------------

export async function submitContactMessage({ name, email, message }) {
  await addDoc(collection(db, 'messages'), {
    name: name || 'anonymous',
    email: email || '',
    message,
    createdAt: serverTimestamp(),
  });
}

export async function fetchMessages() {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteMessage(messageId) {
  await deleteDoc(doc(db, 'messages', messageId));
}