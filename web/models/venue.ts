export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isPaid?: boolean;
  photoURL?: string;
  createdBy: string;
  createdAt: import("firebase/firestore").Timestamp;
}
