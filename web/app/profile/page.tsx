"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDocument, setDocument } from "@/services/firestore";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import type { UserProfile, VolleyPosition } from "@/models/user";
import { Timestamp } from "firebase/firestore";

const POSITIONS: VolleyPosition[] = [
  "Universal",
  "Setter",
  "Libero",
  "Outside Hitter",
  "Middle Blocker",
  "Opposite",
];

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function canChangeName(lastChangeDate: Timestamp | undefined): boolean {
  if (!lastChangeDate) return true;
  return Date.now() - lastChangeDate.toDate().getTime() >= THREE_MONTHS_MS;
}

function nextChangeDate(lastChangeDate: Timestamp): string {
  const next = new Date(lastChangeDate.toDate().getTime() + THREE_MONTHS_MS);
  return next.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [position, setPosition] = useState<VolleyPosition>("Universal");
  const [skillLevel, setSkillLevel] = useState(3);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    getDocument<UserProfile>("users", user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setDisplayName(p.displayName ?? "");
        setPosition((p.position as VolleyPosition) ?? "Universal");
        setSkillLevel(p.skillLevel ?? 3);
      }
      setFetching(false);
    });
  }, [user, loading, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);

    try {
      const nameChanged = displayName !== profile?.displayName;
      if (nameChanged && !canChangeName(profile?.lastNameChangeDate)) {
        setError(
          `İsim değişikliği ${nextChangeDate(profile!.lastNameChangeDate)} tarihine kadar mümkün değil.`
        );
        setSaving(false);
        return;
      }

      const updates: Partial<UserProfile> & Record<string, unknown> = {
        displayName,
        position,
        skillLevel,
      };

      if (nameChanged) {
        updates.lastNameChangeDate = Timestamp.now();
      }

      await setDocument("users", user.uid, updates);

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName,
              position,
              skillLevel,
              lastNameChangeDate: nameChanged
                ? Timestamp.now()
                : prev.lastNameChangeDate,
            }
          : prev
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Kaydetme başarısız.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || fetching) return <Loader className="mt-20" />;
  if (!user) return null;

  const nameChangeable = canChangeName(profile?.lastNameChangeDate);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profil</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Maç", value: profile?.matchesPlayed ?? 0 },
          { label: "Rating", value: profile?.rating?.toFixed(1) ?? "—" },
          { label: "Seviye", value: profile?.skillLevel ?? "—" },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {s.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <form onSubmit={handleSave} className="space-y-5">
          {/* Display name */}
          <div>
            <Input
              id="displayName"
              label="Görünen Ad"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!nameChangeable}
              placeholder="Adın"
              required
            />
            {!nameChangeable && profile?.lastNameChangeDate && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ İsim değişikliği {nextChangeDate(profile.lastNameChangeDate)} tarihinde mümkün olacak.
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <Input
            id="email"
            label="E-posta"
            value={user.email ?? "Anonim kullanıcı"}
            disabled
          />

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pozisyon
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as VolleyPosition)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Skill level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seviye: <span className="text-blue-600 dark:text-blue-400 font-bold">{skillLevel}</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={skillLevel}
              onChange={(e) => setSkillLevel(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 Başlangıç</span>
              <span>3 Orta</span>
              <span>5 Uzman</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>
              Kaydet
            </Button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">
                ✓ Kaydedildi
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Support link */}
      <div className="mt-6 text-center">
        <Link
          href="/support"
          className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          Yardım & Destek
        </Link>
      </div>
    </div>
  );
}
