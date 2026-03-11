"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToActiveMatches } from "@/services/matches";
import { subscribeToVenues } from "@/services/venues";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";
import type { Venue } from "@/models/venue";

const MatchMap = dynamic(() => import("@/components/MatchMap"), { ssr: false });

interface VenueGroup {
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  matches: VolleyMatch[];
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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [matches, setMatches] = useState<VolleyMatch[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    const unsubVenues = subscribeToVenues((v, err) => {
      // Cancel timeout — Firestore responded (success or error)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (err) setFetchError(err);
      setVenues(v);
      setFetching(false);
    });

    const unsubMatches = subscribeToActiveMatches((m) => setMatches(m));

    timeoutRef.current = setTimeout(() => {
      setFetchError(
        "Firestore bağlantısı kurulamadı. Firebase Console → Firestore → Rules bölümünden kuralları publish et."
      );
      setFetching(false);
    }, 10000);

    return () => {
      unsubVenues();
      unsubMatches();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, loading, router]);

  // Merge: for each venue, find its active matches by venueName
  const venueGroups: VenueGroup[] = venues.map((v) => ({
    venueName: v.name,
    venueAddress: v.address,
    latitude: v.latitude,
    longitude: v.longitude,
    matches: matches.filter((m) => m.venueName === v.name),
  }));

  if (loading || fetching) return <Loader className="mt-20" />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sahalar</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {venueGroups.length} saha · {venueGroups.reduce((a, v) => a + v.matches.length, 0)} aktif maç
        </span>
      </div>

      {fetchError && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          ⚠️ {fetchError}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Venue list */}
        <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
          {venueGroups.length === 0 ? (
            <Card className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">📍</div>
              <p>Henüz saha eklenmemiş.</p>
            </Card>
          ) : (
            venueGroups.map((venue) => (
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
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      venue.matches.length > 0
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}>
                    {venue.matches.length > 0 ? `${venue.matches.length} maç` : "Maç yok"}
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
          {venueGroups.length > 0 ? (
            <MatchMap venues={venueGroups} selectedVenue={selected} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400">
              Harita için saha gerekli
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
