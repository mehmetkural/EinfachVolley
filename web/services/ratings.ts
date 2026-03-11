import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/client";

/**
 * Complete a match: set status=completed, store attendees, increment matchesPlayed.
 */
export async function completeMatch(
  matchId: string,
  attendees: string[]
): Promise<void> {
  const matchRef = doc(db, "matches", matchId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(matchRef);
    if (!snap.exists()) throw new Error("Maç bulunamadı.");

    // Increment matchesPlayed for each attendee
    for (const uid of attendees) {
      const userRef = doc(db, "users", uid);
      const userSnap = await tx.get(userRef);
      const current = userSnap.exists() ? (userSnap.data().matchesPlayed ?? 0) : 0;
      tx.set(userRef, { matchesPlayed: current + 1 }, { merge: true });
    }

    tx.update(matchRef, {
      status: "completed",
      attendees,
      completedAt: Timestamp.now(),
    });
  });
}

/**
 * Submit a 1-5 star rating from one participant to another.
 * Idempotent: calling again with different score updates the rating.
 */
export async function submitRating(
  matchId: string,
  raterId: string,
  ratedId: string,
  score: number // 1-5
): Promise<void> {
  const ratingDocId = `${raterId}_${ratedId}`;
  const ratingRef = doc(db, "matches", matchId, "ratings", ratingDocId);
  const userRef = doc(db, "users", ratedId);

  await runTransaction(db, async (tx) => {
    const existingSnap = await tx.get(ratingRef);
    const userSnap = await tx.get(userRef);

    const currentRating = userSnap.exists() ? (userSnap.data().rating ?? 0) : 0;
    const currentCount = userSnap.exists() ? (userSnap.data().ratingCount ?? 0) : 0;

    let newRating: number;
    let newCount: number;

    if (existingSnap.exists()) {
      // Update: remove old score, add new score
      const oldScore = existingSnap.data().score as number;
      if (currentCount <= 1) {
        newRating = score;
        newCount = 1;
      } else {
        newRating = (currentRating * currentCount - oldScore + score) / currentCount;
        newCount = currentCount;
      }
    } else {
      // New rating
      newRating = currentCount === 0
        ? score
        : (currentRating * currentCount + score) / (currentCount + 1);
      newCount = currentCount + 1;
    }

    tx.set(ratingRef, { raterId, ratedId, score, matchId, createdAt: Timestamp.now() });
    tx.set(userRef, { rating: Math.round(newRating * 10) / 10, ratingCount: newCount }, { merge: true });
  });
}

/**
 * Get all ratings submitted by raterId in this match.
 * Returns a map of ratedId → score.
 */
export async function getMyRatingsForMatch(
  matchId: string,
  raterId: string
): Promise<Record<string, number>> {
  const ratingsRef = collection(db, "matches", matchId, "ratings");
  const snap = await getDocs(ratingsRef);
  const result: Record<string, number> = {};
  snap.docs.forEach((d) => {
    if (d.data().raterId === raterId) {
      result[d.data().ratedId] = d.data().score;
    }
  });
  return result;
}
