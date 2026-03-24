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
      className="-mx-4 -mt-8 -mb-24 md:-mb-8 relative overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* Map */}
      <div className="absolute inset-0">
        {venueGroups.length > 0 ? (
          <MatchMap venues={venueGroups} selectedVenue={selected} onVenueSelect={setSelected} />
        ) : (
          <div className="h-full flex items-center justify-center bg-surface-container flex-col gap-3">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant">location_off</span>
            <p className="text-on-surface-variant font-medium">{t.venues.noVenues}</p>
          </div>
        )}
      </div>

      {/* Floating top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start justify-between gap-3 pointer-events-none">
        <div className="bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-3 pointer-events-auto border border-outline-variant/10">
          <span className="text-lg font-black text-on-surface dark:text-inverse-on-surface italic uppercase">{t.venues.title}</span>
          <span className="text-xs text-on-surface-variant bg-surface-container rounded-full px-2 py-0.5 font-bold">
            {t.venues.summary.replace("{venues}", String(venueGroups.length)).replace("{matches}", String(totalMatches))}
          </span>
        </div>
        <div className="flex gap-2 pointer-events-auto">
          {isAdmin && (
            <Link
              href="/admin/venues"
              className="kinetic-gradient text-on-primary text-sm font-bold px-3 py-2 rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              {t.venues.addVenue}
            </Link>
          )}
          <button
            onClick={() => setListOpen((o) => !o)}
            className="bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-sm text-on-surface dark:text-inverse-on-surface text-sm font-bold px-3 py-2 rounded-xl shadow-lg transition-colors border border-outline-variant/10"
          >
            {listOpen ? t.venues.closeList : t.venues.openList}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="absolute top-20 left-4 right-4 z-[1000] bg-error/10 border border-error/20 rounded-xl px-4 py-2 text-sm text-error font-medium">
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
              className={`w-full text-left bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-sm rounded-2xl shadow-md p-3 transition-all border-2 ${
                selected === venue.venueName
                  ? "border-primary"
                  : "border-transparent hover:border-outline-variant/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-on-surface dark:text-inverse-on-surface truncate">{venue.venueName}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    {venue.venueAddress}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    venue.matches.length > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {venue.matches.length > 0
                      ? t.venues.matchCount.replace("{count}", String(venue.matches.length))
                      : t.venues.noMatches}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    venue.isPaid
                      ? "bg-primary-fixed/20 text-primary"
                      : "bg-tertiary-container/30 text-on-tertiary-container"
                  }`}>
                    {venue.isPaid ? t.venues.paid : t.venues.free}
                  </span>
                </div>
              </div>
              {venue.matches.slice(0, 2).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs text-on-surface-variant mt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">event</span>
                    {formatDate(m.date)}
                  </span>
                  <span>{t.venues.players.replace("{current}", String(m.currentPlayerCount)).replace("{max}", String(m.maxPlayers))}</span>
                </div>
              ))}
            </button>
          ))}
        </div>
      )}

      {/* Selected venue panel */}
      {selectedGroup && (
        <div className="absolute bottom-4 right-4 z-[1000] w-72 bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-outline-variant/10">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-black text-on-surface dark:text-inverse-on-surface italic uppercase">{selectedGroup.venueName}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                {selectedGroup.venueAddress}
              </p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                selectedGroup.isPaid
                  ? "bg-primary-fixed/20 text-primary"
                  : "bg-tertiary-container/30 text-on-tertiary-container"
              }`}>
                {selectedGroup.isPaid ? t.venues.paidVenue : t.venues.freeVenue}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-on-surface-variant hover:text-on-surface ml-2"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {selectedGroup.matches.length > 0 ? (
            <div className="space-y-2 mt-3">
              {selectedGroup.matches.map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="flex items-center justify-between text-xs bg-primary/5 hover:bg-primary/10 rounded-xl px-3 py-2 transition-colors"
                >
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">event</span>
                    {formatDate(m.date)}
                  </span>
                  <span className={`font-bold ${m.currentPlayerCount >= m.maxPlayers ? "text-error" : "text-primary"}`}>
                    {m.currentPlayerCount}/{m.maxPlayers}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant mt-2 font-medium">{t.venues.noActiveMatches}</p>
          )}

          <Link
            href="/matches/new"
            className="block mt-3 text-center text-xs font-black text-primary dark:text-primary-fixed hover:underline uppercase tracking-wide"
          >
            {t.venues.createHere}
          </Link>
        </div>
      )}
    </div>
  );
}
