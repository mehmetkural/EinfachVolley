import { Timestamp } from "firebase/firestore";

export type MatchStatus = "active" | "cancelled" | "completed";
export type GenderType = "mixed" | "male" | "female";

export interface MatchGuest {
  id: string;
  name: string;
  addedBy: string;
  addedAt: Timestamp;
}

export interface VolleyMatch {
  id: string; // document ID
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  date: Timestamp;
  duration: number;
  genderType: GenderType;
  netHeight: string;
  maxPlayers: number;
  currentPlayerCount: number;
  skillLevelMin: number;
  skillLevelMax: number;
  pricePerPlayer: number;
  notes: string;
  organizerId: string;
  organizerName: string;
  participants: string[];
  guests: Record<string, MatchGuest[]>;
  createdAt: Timestamp;
  status: MatchStatus;
}
