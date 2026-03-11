"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToActiveMatches } from "@/services/matches";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";

// Leaflet must be dynamically imported (no SSR) — it uses window
const MatchMap = dynamic(() => import("@/components/MatchMap"), { ssr: false });

interface VenueGroup {
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  matches: VolleyMatch[];
}

function groupByVenue(matches: VolleyMatch[]): VenueGroup[] {
  const map = new Map<string, VenueGroup>();
  for (const m of matches) {
    if (!map.has(m.venueName)) {
      map.set(m.venueName, {
        venueName: m.venueName,
        venueAddress: m.venueAddress,
        latitude: m.latitude,
        longitude: m.longitude,
        matches: [],
      });
    }
    map.get(m.venueName)!.matches.push(m);
  }
  return Array.from(map.values());
}

function formatDate(ts: { toDate: () => Date }): string {
  return ts.toDate().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VenuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<VenueGroup[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    const unsub = subscribeToActiveMatches((matches) => {
      setVenues(groupByVenue(matches));
      setFetching(false);
    });
    return unsub;
  }, [user, loading, router]);

  if (loading || fetching) return <Loader className="mt-20" />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sahalar</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {venues.length} saha · {venues.reduce((a, v) => a + v.matches.length, 0)} maç
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Venue list */}
        <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
          {venues.length === 0 ? (
            <Card className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">📍</div>
              <p>Aktif maç olan saha yok.</p>
            </Card>
          ) : (
            venues.map((venue) => (
              <Card
                key={venue.venueName}
                className={`cursor-pointer transition-all ${
                  selected === venue.venueName
                    ? "ring-2 ring-blue-500"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelected(venue.venueName)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{venue.venueName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      📍 {venue.venueAddress}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                    {venue.matches.length} maç
                  </span>
                </div>

                <div className="space-y-1">
                  {venue.matches.slice(0, 3).map((m) => (
                    <Link
                      key={m.id}
                      href="/matches"
                      className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>📅 {formatDate(m.date)}</span>
                      <span>
                        {m.currentPlayerCount}/{m.maxPlayers} oyuncu
                      </span>
                    </Link>
                  ))}
                  {venue.matches.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{venue.matches.length - 3} daha...
                    </p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Map */}
        <div className="h-[70vh] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          {venues.length > 0 ? (
            <MatchMap venues={venues} selectedVenue={selected} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400">
              Harita için aktif maç gerekli
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
