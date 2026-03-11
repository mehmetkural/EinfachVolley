import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  position: string;
  skillLevel: number;
  matchesPlayed: number;
  rating: number;
  createdAt: Timestamp;
  lastNameChangeDate: Timestamp;
}

export type VolleyPosition =
  | "Universal"
  | "Setter"
  | "Libero"
  | "Outside Hitter"
  | "Middle Blocker"
  | "Opposite";

export type AppSettings = {
  theme: "light" | "dark" | "system";
  language: "tr" | "en" | "de";
  notifications: boolean;
};
