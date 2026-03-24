"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeToActiveMatches, subscribeToPastMatches, joinMatch } from "@/services/matches";
import { MatchCard } from "@/components/MatchCard";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";

export default function MatchesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [matches, setMatches] = useState<VolleyMatch[]>([]);
  const [pastMatches, setPastMatches] = useState<VolleyMatch[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [pastOpen, setPastOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    const unsubscribe = subscribeToActiveMatches((data, err) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (err) setFetchError(err);
      setMatches(data);
      setFetching(false);
    });

    const unsubPast = subscribeToPastMatches((data) => setPastMatches(data));

    timeoutRef.current = setTimeout(() => {
      setFetchError(t.matches.firestoreError);
      setFetching(false);
    }, 10000);

    return () => {
      unsubscribe();
      unsubPast();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, loading, router]);

  async function handleJoin(matchId: string) {
    if (!user) return;
    await joinMatch(matchId, user.uid);
  }

  if (loading || fetching) return <Loader className="mt-20" />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 pt-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase">{t.matches.title}</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">
            {t.matches.available.replace("{count}", String(matches.length))}
          </p>
        </div>
        <Link
          href="/matches/new"
          className="kinetic-gradient text-on-primary text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-primary/20 hover:scale-105 transition-all"
        >
          + {t.matches.createMatch}
        </Link>
      </div>

      {fetchError && (
        <div className="mb-4 px-4 py-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium">
          ⚠️ {fetchError}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <div className="w-20 h-20 bg-surface-container-low dark:bg-surface-container rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">sports_volleyball</span>
          </div>
          <p className="text-lg font-bold text-on-surface">{t.matches.noMatches}</p>
          <p className="text-sm mt-1">{t.matches.noMatchesDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onJoin={handleJoin}
              isJoined={match.participants.includes(user?.uid ?? "")}
            />
          ))}
        </div>
      )}

      {pastMatches.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setPastOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-low dark:bg-surface-container rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-colors"
          >
            <span>{t.matches.pastMatches.replace("{count}", String(pastMatches.length))}</span>
            <span className="material-symbols-outlined text-[18px]">{pastOpen ? "expand_less" : "expand_more"}</span>
          </button>
          {pastOpen && (
            <div className="space-y-4 mt-3">
              {pastMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isJoined={match.participants.includes(user?.uid ?? "")}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
