"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDocument } from "@/services/firestore";
import { subscribeToActiveMatches } from "@/services/matches";
import { subscribeToVenues } from "@/services/venues";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";
import type { Venue } from "@/models/venue";
import type { UserProfile } from "@/models/user";

const MatchMap = dynamic(() => import("@/components/MatchMap"), { ssr: false });

interface VenueGroup {
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  isPaid: boolean;
  matches: VolleyMatch[];
}

export default function VenuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [matches, setMatches] = useState<VolleyMatch[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [listOpen, setListOpen] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) { router.push("/sign-in"); return; }
    if (!user) return;

    getDocument<UserProfile>("users", user.uid).then((p) => {
      if (p?.isAdmin) setIsAdmin(true);
    });

    const unsubVenues = subscribeToVenues((v, err) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (err) setFetchError(err);
      setVenues(v);
      setFetching(false);
    });

    const unsubMatches = subscribeToActiveMatches((m) => setMatches(m));

    timeoutRef.current = setTimeout(() => {
      setFetchError(t.venues.firestoreError);
      setFetching(false);
    }, 10000);

    return () => {
      unsubVenues();
      unsubMatches();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, loading, router]);

  const venueGroups: VenueGroup[] = venues.map((v) => ({
    venueName: v.name,
    venueAddress: v.address,
    latitude: v.latitude,
    longitude: v.longitude,
    isPaid: v.isPaid ?? false,
    matches: matches.filter((m) => m.venueName === v.name),
  }));

  const totalMatches = venueGroups.reduce((a, v) => a + v.matches.length, 0);
  const selectedGroup = venueGroups.find((v) => v.venueName === selected) ?? null;

  function formatDate(ts: { toDate: () => Date }): string {
    return ts.toDate().toLocaleDateString(t.locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading || fetching) return <Loader className="mt-20" />;

  return (
    <div
      className="-mx-4 -mt-8 -mb-16 md:-mb-0 relative overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* Full-screen map */}
      <div className="absolute inset-0">
        {venueGroups.length > 0 ? (
          <MatchMap
            venues={venueGroups}
            selectedVenue={selected}
            onVenueSelect={setSelected}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400 flex-col gap-3">
            <span className="text-5xl">📍</span>
            <p>{t.venues.noVenues}</p>
          </div>
        )}
      </div>

      {/* Floating top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start justify-between gap-3 pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-3 pointer-events-auto">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.venues.title}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
            {t.venues.summary.replace("{venues}", String(venueGroups.length)).replace("{matches}", String(totalMatches))}
          </span>
        </div>
        <div className="flex gap-2 pointer-events-auto">
          {isAdmin && (
            <Link
              href="/admin/venues"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-xl shadow-lg transition-colors"
            >
              {t.venues.addVenue}
            </Link>
          )}
          <button
            onClick={() => setListOpen((o) => !o)}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-2 rounded-xl shadow-lg transition-colors"
          >
            {listOpen ? t.venues.closeList : t.venues.openList}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="absolute top-20 left-4 right-4 z-[1000] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2 text-sm text-red-700 dark:text-red-400">
          ⚠️ {fetchError}
        </div>
      )}

      {/* Venue list panel */}
      {listOpen && venueGroups.length > 0 && (
        <div className="absolute top-20 left-4 bottom-4 z-[1000] w-72 flex flex-col gap-2 overflow-y-auto">
          {venueGroups.map((venue) => (
            <button
              key={venue.venueName}
              onClick={() => setSelected(venue.venueName)}
              className={`w-full text-left bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-md p-3 transition-all border-2 ${
                selected === venue.venueName
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {venue.venueName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    📍 {venue.venueAddress}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      venue.matches.length > 0
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {venue.matches.length > 0
                      ? t.venues.matchCount.replace("{count}", String(venue.matches.length))
                      : t.venues.noMatches}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${venue.isPaid ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
                    {venue.isPaid ? t.venues.paid : t.venues.free}
                  </span>
                </div>
              </div>

              {venue.matches.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1"
                >
                  <span>📅 {formatDate(m.date)}</span>
                  <span>{t.venues.players.replace("{current}", String(m.currentPlayerCount)).replace("{max}", String(m.maxPlayers))}</span>
                </div>
              ))}
            </button>
          ))}
        </div>
      )}

      {/* Selected venue bottom panel */}
      {selectedGroup && (
        <div className="absolute bottom-4 right-4 z-[1000] w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{selectedGroup.venueName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📍 {selectedGroup.venueAddress}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${selectedGroup.isPaid ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
                {selectedGroup.isPaid ? t.venues.paidVenue : t.venues.freeVenue}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none ml-2"
            >
              ✕
            </button>
          </div>

          {selectedGroup.matches.length > 0 ? (
            <div className="space-y-2 mt-3">
              {selectedGroup.matches.map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">📅 {formatDate(m.date)}</span>
                  <span className={`font-medium ${m.currentPlayerCount >= m.maxPlayers ? "text-red-500" : "text-blue-600 dark:text-blue-400"}`}>
                    {m.currentPlayerCount}/{m.maxPlayers}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">{t.venues.noActiveMatches}</p>
          )}

          <Link
            href="/matches/new"
            className="block mt-3 text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.venues.createHere}
          </Link>
        </div>
      )}
    </div>
  );
}
