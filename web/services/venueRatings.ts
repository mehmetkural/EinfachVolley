import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/client";

export interface VenueRatingData {
  avg: number;
  count: number;
  myScore: number | null;
}

export async function rateVenue(
  venueId: string,
  userId: string,
  score: number
): Promise<void> {
  await setDoc(doc(db, "venueRatings", `${venueId}_${userId}`), {
    venueId,
    userId,
    score,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchVenueRatings(
  venueId: string,
  userId: string
): Promise<VenueRatingData> {
  const q = query(collection(db, "venueRatings"), where("venueId", "==", venueId));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => d.data() as { userId: string; score: number });
  const count = docs.length;
  const avg = count > 0 ? docs.reduce((s, d) => s + d.score, 0) / count : 0;
  const mine = docs.find((d) => d.userId === userId);
  return { avg, count, myScore: mine?.score ?? null };
}
