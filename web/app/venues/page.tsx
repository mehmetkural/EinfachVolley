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
import { fetchVenueRatings, rateVenue } from "@/services/venueRatings";
import type { VenueRatingData } from "@/services/venueRatings";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";
import type { Venue, VenueType } from "@/models/venue";
import type { UserProfile } from "@/models/user";

const MatchMap = dynamic(() => import("@/components/MatchMap"), { ssr: false });

interface VenueGroup {
  venueId: string;
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  isPaid: boolean;
  type?: VenueType;
  photoUrls?: string[];
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
  const [typeFilter, setTypeFilter] = useState<VenueType | "all">("all");
  const [venueRating, setVenueRating] = useState<VenueRatingData | null>(null);
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

  // Fetch ratings when a venue is selected
  useEffect(() => {
    if (!selected || !user) { setVenueRating(null); return; }
    const grp = allVenueGroups.find((v) => v.venueName === selected);
    if (!grp) return;
    fetchVenueRatings(grp.venueId, user.uid).then(setVenueRating);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, user]);

  const allVenueGroups: VenueGroup[] = venues.map((v) => ({
    venueId: v.id,
    venueName: v.name,
    venueAddress: v.address,
    latitude: v.latitude,
    longitude: v.longitude,
    isPaid: v.isPaid ?? false,
    type: v.type,
    photoUrls: v.photoUrls,
    matches: matches.filter((m) => m.venueName === v.name),
  }));

  // Filter sidebar only — map always shows all venues
  const filteredGroups: VenueGroup[] = typeFilter === "all"
    ? allVenueGroups
    : allVenueGroups.filter((v) => {
        if (typeFilter === "beach") return v.venueName.toLowerCase().includes("beach") || v.type === "beach";
        return v.type === typeFilter;
      });

  // Sort: active matches first, then alphabetically
  const venueGroups = [...filteredGroups].sort((a, b) => {
    if (b.matches.length !== a.matches.length) return b.matches.length - a.matches.length;
    return a.venueName.localeCompare(b.venueName);
  });

  const totalMatches = filteredGroups.reduce((a, v) => a + v.matches.length, 0);
  const selectedGroup = allVenueGroups.find((v) => v.venueName === selected) ?? null;

  function formatDate(ts: { toDate: () => Date }): string {
    return ts.toDate().toLocaleDateString(t.locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleRateVenue(score: number) {
    if (!user || !selectedGroup) return;
    await rateVenue(selectedGroup.venueId, user.uid, score);
    setVenueRating((prev) => {
      if (!prev) return { avg: score, count: 1, myScore: score };
      const wasRated = prev.myScore !== null;
      const newCount = wasRated ? prev.count : prev.count + 1;
      const newAvg = wasRated
        ? ((prev.avg * prev.count) - (prev.myScore ?? 0) + score) / prev.count
        : ((prev.avg * prev.count) + score) / newCount;
      return { avg: newAvg, count: newCount, myScore: score };
    });
  }

  if (loading || fetching) return <Loader className="mt-20" />;

  return (
    <div
      className="-mx-4 -mt-8 -mb-24 md:-mb-8 relative overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* Map — always uses allVenueGroups so filter doesn't break/reload it */}
      <div className="absolute inset-0">
        {allVenueGroups.length > 0 ? (
          <MatchMap venues={allVenueGroups} selectedVenue={selected} onVenueSelect={setSelected} />
        ) : (
          <div className="h-full flex items-center justify-center bg-surface-container flex-col gap-3">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant">location_off</span>
            <p className="text-on-surface-variant font-medium">{t.venues.noVenues}</p>
          </div>
        )}
      </div>

      {/* Floating top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="flex items-start justify-between gap-3">
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

        {/* Type filter chips */}
        <div className="flex gap-1.5 pointer-events-auto flex-wrap">
          {(["all", "beach", "outdoor", "indoor"] as const).map((type) => {
            const labels = { all: t.venues.filterAll, beach: t.venues.filterBeach, outdoor: t.venues.filterOutdoor, indoor: t.venues.filterIndoor };
            const icons = { all: "filter_list", beach: "beach_access", outdoor: "wb_sunny", indoor: "sports_volleyball" };
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow backdrop-blur-sm transition-all ${
                  typeFilter === type
                    ? "kinetic-gradient text-on-primary shadow-primary/20"
                    : "bg-surface-container-lowest/90 dark:bg-inverse-surface/90 text-on-surface dark:text-inverse-on-surface border border-outline-variant/10"
                }`}
              >
                <span className="material-symbols-outlined text-[14px] [font-style:normal]">{icons[type]}</span>
                {labels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="absolute top-32 left-4 right-4 z-[1000] bg-error/10 border border-error/20 rounded-xl px-4 py-2 text-sm text-error font-medium">
          ⚠️ {fetchError}
        </div>
      )}

      {/* Venue list panel — sidebar on desktop, horizontal scrolling strip on mobile */}
      {listOpen && venueGroups.length > 0 && (
        <div className="absolute z-[1000] left-4 top-32 right-4 md:right-auto md:bottom-4 md:w-72">
          {/* Mobile: horizontal scroll with fade indicator */}
          <div className="relative md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1 scroll-smooth" style={{ scrollbarWidth: "none" }}>
              {venueGroups.map((venue) => (
                <button
                  key={venue.venueName}
                  onClick={() => setSelected(venue.venueName)}
                  className={`shrink-0 text-left bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-sm rounded-2xl shadow-md p-3 transition-all border-2 w-44 ${
                    selected === venue.venueName ? "border-primary" : "border-transparent"
                  }`}
                >
                  <p className="font-bold text-sm text-on-surface dark:text-inverse-on-surface truncate">{venue.venueName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      venue.matches.length > 0
                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                        : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {venue.matches.length > 0 ? t.venues.matchCount.replace("{count}", String(venue.matches.length)) : t.venues.noMatches}
                    </span>
                  </div>
                </button>
              ))}
              {/* Scroll hint card */}
              <div className="shrink-0 w-6" />
            </div>
            {/* Right fade gradient indicating scrollability */}
            <div className="absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-black/25 to-transparent pointer-events-none rounded-r-2xl flex items-center justify-end pr-1">
              <span className="material-symbols-outlined text-white text-[16px] opacity-80">chevron_right</span>
            </div>
          </div>

          {/* Desktop: vertical sidebar */}
          <div className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {venueGroups.map((venue) => (
              <button
                key={venue.venueName}
                onClick={() => setSelected(venue.venueName)}
                className={`w-full text-left bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-sm rounded-2xl shadow-md p-3 transition-all border-2 ${
                  selected === venue.venueName ? "border-primary" : "border-transparent hover:border-outline-variant/30"
                }`}
              >
                <p className="font-bold text-sm text-on-surface dark:text-inverse-on-surface truncate">{venue.venueName}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    venue.matches.length > 0
                      ? "bg-green-500/15 text-green-600 dark:text-green-400"
                      : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {venue.matches.length > 0 ? t.venues.matchCount.replace("{count}", String(venue.matches.length)) : t.venues.noMatches}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    venue.isPaid ? "bg-primary-fixed/20 text-primary" : "bg-tertiary-container/30 text-on-tertiary-container"
                  }`}>
                    {venue.isPaid ? t.venues.paid : t.venues.free}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 truncate flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  {venue.venueAddress}
                </p>
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
        </div>
      )}

      {/* Selected venue panel */}
      {selectedGroup && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-72 z-[1000] bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-outline-variant/10">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-black text-on-surface dark:text-inverse-on-surface italic uppercase">{selectedGroup.venueName}</h3>
              <a
                href={`https://www.google.com/maps?q=${selectedGroup.latitude},${selectedGroup.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary dark:text-primary-fixed mt-0.5 flex items-center gap-1 underline w-fit"
              >
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                {selectedGroup.venueAddress}
              </a>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                selectedGroup.isPaid ? "bg-primary-fixed/20 text-primary" : "bg-tertiary-container/30 text-on-tertiary-container"
              }`}>
                {selectedGroup.isPaid ? t.venues.paidVenue : t.venues.freeVenue}
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface ml-2">
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

          {/* Venue rating */}
          <div className="mt-3 pt-3 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.venues.rateVenue}</span>
              {venueRating && venueRating.count > 0 && (
                <span className="text-xs text-on-surface-variant">
                  {venueRating.avg.toFixed(1)} ★ · {t.venues.ratingCount.replace("{count}", String(venueRating.count))}
                </span>
              )}
              {venueRating && venueRating.count === 0 && (
                <span className="text-xs text-on-surface-variant">{t.venues.noRatings}</span>
              )}
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRateVenue(star)}
                  className={`text-xl leading-none transition-transform active:scale-110 ${
                    (venueRating?.myScore ?? 0) >= star ? "text-amber-400" : "text-outline-variant"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <Link
            href={`/matches/new?venue=${selectedGroup.venueId}`}
            className="block mt-3 text-center text-xs font-black text-primary dark:text-primary-fixed hover:underline uppercase tracking-wide"
          >
            {t.venues.createHere}
          </Link>
        </div>
      )}
    </div>
  );
}
