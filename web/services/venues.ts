import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { Venue } from "@/models/venue";

/** Get all venues once */
export async function getVenues(): Promise<Venue[]> {
  const q = query(collection(db, "venues"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Venue);
}

/** Subscribe to venues in real-time */
export function subscribeToVenues(
  callback: (venues: Venue[], error?: string) => void
): () => void {
  const q = query(collection(db, "venues"), orderBy("name", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Venue));
    },
    (err) => {
      console.error("[Firestore] subscribeToVenues:", err);
      callback([], err.message);
    }
  );
}

/** Add a new venue (admin only — enforced by Firestore rules) */
export async function addVenue(
  data: Omit<Venue, "id" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, "venues"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update a venue (admin only) */
export async function updateVenue(
  id: string,
  data: Partial<Omit<Venue, "id" | "createdAt" | "createdBy">>
): Promise<void> {
  await updateDoc(doc(db, "venues", id), data);
}

/** Delete a venue (admin only) */
export async function deleteVenue(id: string): Promise<void> {
  await deleteDoc(doc(db, "venues", id));
}
