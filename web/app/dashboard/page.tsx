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

  const stats = [
    {
      label: t.dashboard.matchesPlayed,
      value: profile?.matchesPlayed ?? 0,
      icon: "sports_volleyball",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: t.dashboard.rating,
      value: profile?.rating?.toFixed(1) ?? "—",
      icon: "star",
      color: "text-primary-fixed-dim",
      bg: "bg-primary-fixed/15",
    },
    {
      label: t.dashboard.level,
      value: profile?.skillLevel ? skillLabels[profile.skillLevel as keyof typeof skillLabels] ?? profile.skillLevel : "—",
      icon: "monitoring",
      color: "text-tertiary",
      bg: "bg-tertiary/10",
    },
    {
      label: t.dashboard.position,
      value: profile?.position
        ? `${POSITION_ICONS[profile.position] ?? ""} ${profile.position}`
        : "—",
      icon: "person",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.dashboard.welcome}</p>
          <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase">{firstName}</h1>
        </div>
        <Link
          href="/matches/new"
          className="kinetic-gradient text-on-primary text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-primary/20 hover:scale-105 transition-all"
        >
          + {t.dashboard.createMatch}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-4 border border-outline-variant/10"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
              <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
            </div>
            <div className="text-xl font-black text-on-surface truncate">{stat.value}</div>
            <div className="text-xs text-on-surface-variant mt-0.5 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-on-surface uppercase tracking-tight">{t.dashboard.myMatches}</h2>
          <Link href="/matches" className="text-sm text-primary dark:text-primary-fixed hover:underline font-bold">
            {t.dashboard.viewAll}
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-10 text-center border border-outline-variant/10">
            <div className="w-16 h-16 bg-surface-container-low dark:bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">sports_volleyball</span>
            </div>
            <p className="font-bold text-on-surface mb-1">{t.dashboard.noMatches}</p>
            <p className="text-sm text-on-surface-variant mb-5">{t.dashboard.noMatchesDesc}</p>
            <Link
              href="/matches"
              className="inline-block kinetic-gradient text-on-primary text-sm font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition-all shadow-sm shadow-primary/20"
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
