export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdBy: string;
  createdAt: import("firebase/firestore").Timestamp;
}
