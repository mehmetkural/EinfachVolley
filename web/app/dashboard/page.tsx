"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToMyMatches } from "@/services/matches";
import { getDocument } from "@/services/firestore";
import { MatchCard } from "@/components/MatchCard";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Button";
import type { VolleyMatch } from "@/models/match";
import type { UserProfile } from "@/models/user";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<VolleyMatch[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    // Load user profile
    getDocument<UserProfile>("users", user.uid).then((p) => setProfile(p));

    // Subscribe to my matches
    const unsubscribe = subscribeToMyMatches(user.uid, (data) => {
      setMatches(data);
      setFetching(false);
    });

    return unsubscribe;
  }, [user, loading, router]);

  if (loading || fetching) return <Loader className="mt-20" />;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Hoş geldin, {profile?.displayName ?? user.email}
          </p>
        </div>
        <Link href="/matches">
          <Button>Tüm Maçları Gör</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Oynanan Maç", value: profile?.matchesPlayed ?? 0 },
          { label: "Rating", value: profile?.rating?.toFixed(1) ?? "—" },
          { label: "Seviye", value: profile?.skillLevel ?? "—" },
          { label: "Pozisyon", value: profile?.position ?? "—" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* My active matches */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Katıldığım Maçlar</h2>
        {matches.length === 0 ? (
          <Card className="text-center py-10 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">🏐</div>
            <p>Henüz aktif bir maçın yok.</p>
            <Link href="/matches" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">Maç Bul</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} isJoined />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
