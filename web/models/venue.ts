export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isPaid?: boolean;
  photoUrls?: string[];
  notes?: string;
  createdBy: string;
  createdAt: import("firebase/firestore").Timestamp;
}
