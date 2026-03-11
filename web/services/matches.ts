"use client";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { VolleyMatch } from "@/models/match";

/** Subscribe to all active upcoming matches (real-time) */
export function subscribeToActiveMatches(
  callback: (matches: VolleyMatch[]) => void
): () => void {
  const nowMinus5 = new Date(Date.now() - 5 * 60 * 1000);
  const q = query(
    collection(db, "matches"),
    where("status", "==", "active"),
    where("date", ">=", Timestamp.fromDate(nowMinus5)),
    orderBy("date", "asc")
  );

  return onSnapshot(q, (snap) => {
    const matches = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as VolleyMatch[];
    callback(matches);
  });
}

/** Subscribe to matches where user is a participant (real-time) */
export function subscribeToMyMatches(
  uid: string,
  callback: (matches: VolleyMatch[]) => void
): () => void {
  const q = query(
    collection(db, "matches"),
    where("participants", "array-contains", uid),
    where("status", "==", "active")
  );

  return onSnapshot(q, (snap) => {
    const matches = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as VolleyMatch[];
    callback(matches);
  });
}

/** Join a match as a registered user */
export async function joinMatch(matchId: string, uid: string): Promise<void> {
  const ref = doc(db, "matches", matchId);
  await updateDoc(ref, {
    participants: arrayUnion(uid),
    currentPlayerCount: increment(1),
  });
}
