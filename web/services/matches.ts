"use client";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
  getDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { VolleyMatch, MatchGuest } from "@/models/match";

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

/** Leave a match */
export async function leaveMatch(matchId: string, uid: string): Promise<void> {
  const ref = doc(db, "matches", matchId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Match not found");
    const data = snap.data();
    const newGuests = { ...data.guests };
    delete newGuests[uid];
    tx.update(ref, {
      participants: arrayRemove(uid),
      currentPlayerCount: increment(-1),
      guests: newGuests,
    });
  });
}

/** Add a guest to a match */
export async function addGuest(
  matchId: string,
  uid: string,
  guestName: string
): Promise<void> {
  const ref = doc(db, "matches", matchId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Match not found");
    const data = snap.data();
    const existingGuests: MatchGuest[] = data.guests?.[uid] ?? [];
    const newGuest: MatchGuest = {
      id: crypto.randomUUID(),
      name: guestName,
      addedBy: uid,
      addedAt: Timestamp.now(),
    };
    tx.update(ref, {
      [`guests.${uid}`]: [...existingGuests, newGuest],
      currentPlayerCount: increment(1),
    });
  });
}

/** Remove a guest from a match */
export async function removeGuest(
  matchId: string,
  uid: string,
  guestId: string
): Promise<void> {
  const ref = doc(db, "matches", matchId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Match not found");
    const data = snap.data();
    const existingGuests: MatchGuest[] = data.guests?.[uid] ?? [];
    const updated = existingGuests.filter((g) => g.id !== guestId);
    const updateData: Record<string, unknown> = {
      currentPlayerCount: increment(-1),
    };
    if (updated.length === 0) {
      updateData[`guests.${uid}`] = deleteField();
    } else {
      updateData[`guests.${uid}`] = updated;
    }
    tx.update(ref, updateData);
  });
}

/** Cancel a match (organizer only) */
export async function cancelMatch(matchId: string): Promise<void> {
  const ref = doc(db, "matches", matchId);
  await updateDoc(ref, { status: "cancelled" });
}

/** Get a single match by ID */
export async function getMatch(matchId: string): Promise<VolleyMatch | null> {
  const ref = doc(db, "matches", matchId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as VolleyMatch) : null;
}

/** Subscribe to a single match (real-time) */
export function subscribeToMatch(
  matchId: string,
  callback: (match: VolleyMatch | null) => void
): () => void {
  const ref = doc(db, "matches", matchId);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as VolleyMatch) : null);
  });
}
