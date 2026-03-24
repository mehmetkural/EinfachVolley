"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function canChangeName(lastChangeDate: Timestamp | undefined): boolean {
  if (!lastChangeDate) return true;
  return Date.now() - lastChangeDate.toDate().getTime() >= THREE_MONTHS_MS;
}

function nextChangeDateStr(lastChangeDate: Timestamp, locale: string): string {
  const next = new Date(lastChangeDate.toDate().getTime() + THREE_MONTHS_MS);
  return next.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
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
        setError(t.profile.nameChangeLocked.replace("{date}", nextChangeDateStr(profile!.lastNameChangeDate, t.locale)));
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
      setError(e instanceof Error ? e.message : t.profile.errorSave);
    } finally {
      setSaving(false);
    }
  }

  if (loading || fetching) return <Loader className="mt-20" />;
  if (!user) return null;

  const nameChangeable = canChangeName(profile?.lastNameChangeDate);
  const skillLabels = t.skill;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase pt-2">{t.profile.title}</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t.profile.matches, value: profile?.matchesPlayed ?? 0, color: "text-primary", bg: "bg-primary/10" },
          { label: t.profile.rating, value: profile?.rating?.toFixed(1) ?? "—", color: "text-primary-fixed-dim", bg: "bg-primary-fixed/15" },
          { label: t.profile.level, value: skillLabels[profile?.skillLevel as keyof typeof skillLabels ?? 0] ?? "—", color: "text-tertiary", bg: "bg-tertiary/10" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-4 text-center border border-outline-variant/10">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-on-surface-variant mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <Input
              id="displayName"
              label={t.profile.displayName}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!nameChangeable}
              placeholder={t.profile.namePlaceholder}
              required
            />
            {!nameChangeable && profile?.lastNameChangeDate && (
              <p className="mt-2 text-xs text-primary-fixed-dim flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {t.profile.nameChangeAvailable.replace("{date}", nextChangeDateStr(profile.lastNameChangeDate, t.locale))}
              </p>
            )}
          </div>

          <Input id="email" label={t.profile.email} value={user.email ?? t.profile.anonymous} disabled />

          {/* Position */}
          <div>
            <label className="block text-xs font-bold text-secondary dark:text-outline-variant uppercase tracking-widest mb-3">
              {t.profile.position}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all text-left active:scale-95 ${
                    position === p
                      ? "kinetic-gradient text-on-primary shadow-sm shadow-primary/20"
                      : "bg-surface-container-low dark:bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Skill level */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-secondary dark:text-outline-variant uppercase tracking-widest">
                {t.profile.skillLevel}
              </label>
              <span className="text-sm font-black text-primary dark:text-primary-fixed">
                {skillLevel} — {skillLabels[skillLevel as keyof typeof skillLabels]}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={skillLevel}
              onChange={(e) => setSkillLevel(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-on-surface-variant mt-1 font-medium">
              <span>{skillLabels[1]}</span>
              <span>{skillLabels[3]}</span>
              <span>{skillLabels[5]}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-error flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full kinetic-gradient disabled:opacity-60 text-on-primary font-black py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
          >
            {saving ? t.profile.saving : saved ? t.profile.saved : t.profile.save}
          </button>
        </form>
      </div>

      <div className="text-center pb-2">
        <Link href="/support" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium">
          {t.profile.support}
        </Link>
      </div>
    </div>
  );
}
