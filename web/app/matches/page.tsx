"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToActiveMatches, joinMatch } from "@/services/matches";
import { MatchCard } from "@/components/MatchCard";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";

export default function MatchesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<VolleyMatch[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    const unsubscribe = subscribeToActiveMatches((data) => {
      setMatches(data);
      setFetching(false);
    });

    return unsubscribe;
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
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {matches.length} maç
        </span>
      </div>

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
    </div>
  );
}
