"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToActiveMatches, subscribeToPastMatches, joinMatch } from "@/services/matches";
import { MatchCard } from "@/components/MatchCard";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import type { VolleyMatch } from "@/models/match";

export default function MatchesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
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
      setFetchError(
        "Firestore bağlantısı kurulamadı. Firebase Console → Firestore → Rules → allow read: if request.auth != null"
      );
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Aktif Maçlar</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {matches.length} maç
          </span>
          <Link href="/matches/new">
            <Button size="sm">Maç Oluştur</Button>
          </Link>
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          ⚠️ {fetchError}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <div className="text-5xl mb-4">🏐</div>
          <p className="text-lg font-medium">Aktif maç yok</p>
          <p className="text-sm mt-1">Şu an katılabilecek bir maç bulunmuyor.</p>
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

      {/* Past matches collapsible */}
      {pastMatches.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setPastOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span>Geçmiş Maçlar ({pastMatches.length})</span>
            <span>{pastOpen ? "▲" : "▼"}</span>
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
