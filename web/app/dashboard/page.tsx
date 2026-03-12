"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeToMyMatches } from "@/services/matches";
import { getDocument } from "@/services/firestore";
import { MatchCard } from "@/components/MatchCard";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";
import type { UserProfile } from "@/models/user";

const POSITION_ICONS: Record<string, string> = {
  Universal: "🔄",
  Setter: "🎯",
  Libero: "🛡️",
  "Outside Hitter": "⚡",
  "Middle Blocker": "🧱",
  Opposite: "🏹",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [matches, setMatches] = useState<VolleyMatch[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) { router.push("/sign-in"); return; }
    if (!user) return;

    getDocument<UserProfile>("users", user.uid).then((p) => setProfile(p));

    const unsubscribe = subscribeToMyMatches(user.uid, (data) => {
      setMatches(data);
      setFetching(false);
    });

    return unsubscribe;
  }, [user, loading, router]);

  if (loading || fetching) return <Loader className="mt-20" />;
  if (!user) return null;

  const firstName = profile?.displayName?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Oyuncu";
  const skillLabels = t.skill;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.dashboard.welcome}</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{firstName}</h1>
        </div>
        <Link
          href="/matches/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          {t.dashboard.createMatch}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: t.dashboard.matchesPlayed,
            value: profile?.matchesPlayed ?? 0,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3c0 0 2 3 2 9s-2 9-2 9" /><path d="M12 3c0 0-2 3-2 9s2 9 2 9" />
                <path d="M3.5 8.5h17M3.5 15.5h17" />
              </svg>
            ),
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: t.dashboard.rating,
            value: profile?.rating?.toFixed(1) ?? "—",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ),
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
          },
          {
            label: t.dashboard.level,
            value: profile?.skillLevel ? skillLabels[profile.skillLevel as keyof typeof skillLabels] ?? profile.skillLevel : "—",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <rect x="3" y="13" width="4" height="8" rx="1" /><rect x="10" y="9" width="4" height="12" rx="1" /><rect x="17" y="4" width="4" height="17" rx="1" />
              </svg>
            ),
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            label: t.dashboard.position,
            value: profile?.position
              ? `${POSITION_ICONS[profile.position] ?? ""} ${profile.position}`
              : "—",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
              </svg>
            ),
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.dashboard.myMatches}</h2>
          <Link href="/matches" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
            {t.dashboard.viewAll}
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-400">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3c0 0 2 3 2 9s-2 9-2 9" /><path d="M12 3c0 0-2 3-2 9s2 9 2 9" />
                <path d="M3.5 8.5h17M3.5 15.5h17" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{t.dashboard.noMatches}</p>
            <p className="text-sm text-gray-400 mb-4">{t.dashboard.noMatchesDesc}</p>
            <Link
              href="/matches"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              {t.dashboard.findMatch}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} isJoined />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
