// Firestore CRUD abstraction layer — client-side only
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/client";

/** Get a single document by collection and id */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

/** Set (create or overwrite) a document */
export async function setDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = doc(db, collectionName, id);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Update specific fields in a document (creates if doesn't exist) */
export async function updateDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = doc(db, collectionName, id);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Delete a document */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
}

/** Add a new document (auto-generated id) */
export async function addDocument(
  collectionName: string,
  data: Record<string, unknown>
): Promise<string> {
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
