"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getDocument, setDocument } from "@/services/firestore";
import { Input } from "@/components/Input";
import { Loader } from "@/components/Loader";
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

const SKILL_LABELS: Record<number, string> = {
  1: "Başlangıç",
  2: "Amatör",
  3: "Orta",
  4: "İleri",
  5: "Uzman",
};

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function canChangeName(lastChangeDate: Timestamp | undefined): boolean {
  if (!lastChangeDate) return true;
  return Date.now() - lastChangeDate.toDate().getTime() >= THREE_MONTHS_MS;
}

function nextChangeDate(lastChangeDate: Timestamp): string {
  const next = new Date(lastChangeDate.toDate().getTime() + THREE_MONTHS_MS);
  return next.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
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
    if (!loading && !user) { router.push("/sign-in"); return; }
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
        setError(`İsim değişikliği ${nextChangeDate(profile!.lastNameChangeDate)} tarihine kadar mümkün değil.`);
        setSaving(false);
        return;
      }

      const updates: Partial<UserProfile> & Record<string, unknown> = { displayName, position, skillLevel };
      if (nameChanged) updates.lastNameChangeDate = Timestamp.now();

      await setDocument("users", user.uid, updates);

      setProfile((prev) =>
        prev ? { ...prev, displayName, position, skillLevel, lastNameChangeDate: nameChanged ? Timestamp.now() : prev.lastNameChangeDate } : prev
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
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Profil</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Maç", value: profile?.matchesPlayed ?? 0, color: "text-blue-600 dark:text-blue-400" },
          { label: "Rating", value: profile?.rating?.toFixed(1) ?? "—", color: "text-amber-600 dark:text-amber-400" },
          { label: "Seviye", value: SKILL_LABELS[profile?.skillLevel ?? 0] ?? "—", color: "text-emerald-600 dark:text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-5">
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
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                İsim değişikliği {nextChangeDate(profile.lastNameChangeDate)} tarihinde mümkün olacak.
              </p>
            )}
          </div>

          <Input id="email" label="E-posta" value={user.email ?? "Anonim kullanıcı"} disabled />

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pozisyon</label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors text-left ${
                    position === p
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Skill level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Seviye</label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {skillLevel} — {SKILL_LABELS[skillLevel]}
              </span>
            </div>
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
              <span>Başlangıç</span>
              <span>Orta</span>
              <span>Uzman</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {saving ? "Kaydediliyor..." : saved ? "✓ Kaydedildi" : "Kaydet"}
          </button>
        </form>
      </div>

      {/* Support */}
      <div className="text-center pb-2">
        <Link href="/support" className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
          Yardım & Destek
        </Link>
      </div>
    </div>
  );
}
