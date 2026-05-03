import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/client";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: import("firebase/firestore").Timestamp | null;
}

export function subscribeToMessages(
  matchId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, "matches", matchId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
  });
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<void> {
  await addDoc(collection(db, "matches", matchId, "messages"), {
    text: text.trim(),
    senderId,
    senderName,
    createdAt: serverTimestamp(),
  });
}
