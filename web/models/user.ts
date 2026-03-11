export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: "tr" | "en" | "de";
  notifications: boolean;
}
