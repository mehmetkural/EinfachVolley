export type VenueType = "beach" | "outdoor" | "indoor";

export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isPaid?: boolean;
  type?: VenueType;
  photoUrls?: string[];
  notes?: string;
  createdBy: string;
  createdAt: import("firebase/firestore").Timestamp;
}
