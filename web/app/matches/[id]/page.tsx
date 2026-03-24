"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  subscribeToMatch,
  joinMatch,
  leaveMatch,
  addGuest,
  removeGuest,
  cancelMatch,
} from "@/services/matches";
import { completeMatch, submitRating, getMyRatingsForMatch } from "@/services/ratings";
import { getDocument } from "@/services/firestore";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";
import type { UserProfile } from "@/models/user";

function formatDate(ts: { toDate: () => Date }, locale: string): string {
  return ts.toDate().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="text-2xl leading-none transition-transform hover:scale-110"
        >
          <span className={(hover || value) >= star ? "text-primary-fixed-dim" : "text-outline-variant"}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const [match, setMatch] = useState<VolleyMatch | null>(null);
  const [fetching, setFetching] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const fetchedUids = useRef<Set<string>>(new Set());

  const [showComplete, setShowComplete] = useState(false);
  const [attendees, setAttendees] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);

  const [myRatings, setMyRatings] = useState<Record<string, number>>({});
  const [pendingRatings, setPendingRatings] = useState<Record<string, number>>({});
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/sign-in"); return; }
    if (!user) return;

    const unsub = subscribeToMatch(id, (m) => {
      setMatch(m);
      setFetching(false);

      if (m) {
        const missing = m.participants.filter((uid) => !fetchedUids.current.has(uid));
        if (missing.length > 0) {
          missing.forEach((uid) => fetchedUids.current.add(uid));
          Promise.all(missing.map((uid) => getDocument<UserProfile>("users", uid))).then((profiles) => {
            setParticipantNames((prev) => {
              const next = { ...prev };
              profiles.forEach((p, i) => {
                next[missing[i]] = p?.displayName ?? p?.email ?? missing[i].slice(0, 8);
              });
              return next;
            });
          });
        }
      }
    });

    return unsub;
  }, [id, user, loading, router]);

  useEffect(() => {
    if (!user || !match || match.status !== "completed") return;
    getMyRatingsForMatch(id, user.uid).then(setMyRatings);
  }, [id, user, match?.status]);

  if (loading || fetching) return <Loader className="mt-20" />;
  if (!match) return (
    <div className="text-center py-20 text-on-surface-variant">
      {t.matchDetail.notFound}{" "}
      <Link href="/matches" className="text-primary dark:text-primary-fixed hover:underline font-bold">{t.matchDetail.backLink}</Link>
    </div>
  );

  const isOrganizer = user?.uid === match.organizerId;
  const isParticipant = match.participants.includes(user?.uid ?? "");
  const isFull = match.currentPlayerCount >= match.maxPlayers;
  const isCancelled = match.status === "cancelled";
  const isCompleted = match.status === "completed";
  const matchPassed = match.date.toDate() < new Date();
  const myGuests = user ? (match.guests?.[user.uid] ?? []) : [];
  const canComplete = isOrganizer && !isCompleted && !isCancelled && matchPassed;
  const iAttended = match.attendees?.includes(user?.uid ?? "") ?? false;

  async function handle(fn: () => Promise<void>) {
    setActionLoading(true);
    setError("");
    try { await fn(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : t.matchDetail.errorGeneric); }
    finally { setActionLoading(false); }
  }

  async function handleComplete() {
    if (!user) return;
    setCompleting(true);
    try {
      await completeMatch(id, Array.from(attendees));
      setShowComplete(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.matchDetail.errorComplete);
    } finally {
      setCompleting(false);
    }
  }

  async function handleRatingSubmit() {
    if (!user) return;
    setSubmittingRating(true);
    try {
      await Promise.all(
        Object.entries(pendingRatings).map(([ratedId, score]) =>
          submitRating(id, user.uid, ratedId, score)
        )
      );
      setMyRatings((prev) => ({ ...prev, ...pendingRatings }));
      setPendingRatings({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.matchDetail.errorRating);
    } finally {
      setSubmittingRating(false);
    }
  }

  const otherAttendees = (match.attendees ?? []).filter((uid) => uid !== user?.uid);
  const unratedCount = otherAttendees.filter((uid) => !myRatings[uid] && !pendingRatings[uid]).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/matches" className="inline-flex items-center gap-1 text-sm text-primary dark:text-primary-fixed hover:underline font-bold">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        {t.matchDetail.backToMatches}
      </Link>

      {/* Status banners */}
      {isCancelled && (
        <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 text-sm text-error font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          {t.matchDetail.cancelled}
        </div>
      )}
      {isCompleted && (
        <div className="bg-tertiary-container/30 border border-tertiary/20 rounded-xl px-4 py-3 text-sm text-on-tertiary-container font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {t.matchDetail.completed.replace("{count}", String(match.attendees?.length ?? 0))}
        </div>
      )}

      {/* Header */}
      <Card variant="elevated">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-on-surface italic uppercase">{match.venueName}</h1>
            <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {match.venueAddress}
            </p>
          </div>
          <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-black ${
            isFull ? "bg-error/10 text-error" : "bg-tertiary-container/30 text-on-tertiary-container"
          }`}>
            {isFull
              ? t.matchDetail.full
              : t.matchDetail.spotsLeft.replace("{count}", String(match.maxPlayers - match.currentPlayerCount))}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-on-surface-variant font-medium">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
            {formatDate(match.date, t.locale)}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
            {match.duration} {t.matchDetail.hours}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary">sports_volleyball</span>
            Net: {match.netHeight}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">monitoring</span>
            {t.matchDetail.level} {match.skillLevelMin}–{match.skillLevelMax}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">payments</span>
            {match.pricePerPlayer === 0 ? t.matchDetail.free : t.matchDetail.pricePerPerson.replace("{price}", String(match.pricePerPlayer))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary">person</span>
            {match.organizerName}
          </div>
        </div>

        {match.notes && (
          <p className="mt-4 text-sm text-on-surface-variant bg-surface-container-low dark:bg-surface-container rounded-xl px-4 py-3 font-medium">
            {match.notes}
          </p>
        )}
      </Card>

      {/* Actions */}
      {!isCancelled && !isCompleted && (
        <Card>
          <h2 className="font-black text-on-surface uppercase tracking-tight text-sm mb-3">{t.matchDetail.actions}</h2>
          {error && (
            <p className="text-sm text-error flex items-center gap-1.5 font-medium mb-3">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {!isParticipant && !isFull && (
              <Button size="sm" loading={actionLoading}
                onClick={() => handle(() => joinMatch(match.id, user!.uid))}>
                {t.matchDetail.join}
              </Button>
            )}
            {isParticipant && !isOrganizer && (
              <Button variant="secondary" size="sm" loading={actionLoading}
                onClick={() => handle(() => leaveMatch(match.id, user!.uid))}>
                {t.matchDetail.leave}
              </Button>
            )}
            {isOrganizer && !matchPassed && (
              <Button variant="danger" size="sm" loading={actionLoading}
                onClick={() => { if (confirm(t.matchDetail.cancelConfirm)) handle(() => cancelMatch(match.id)); }}>
                {t.matchDetail.cancelMatch}
              </Button>
            )}
            {canComplete && (
              <Button size="sm" onClick={() => { setAttendees(new Set(match.participants)); setShowComplete(true); }}>
                {t.matchDetail.completeMatch}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Complete panel */}
      {showComplete && (
        <Card>
          <h2 className="font-black text-on-surface uppercase tracking-tight text-sm mb-1">{t.matchDetail.completeTitle}</h2>
          <p className="text-sm text-on-surface-variant mb-4 font-medium">{t.matchDetail.completeDesc}</p>
          <div className="space-y-2 mb-4">
            {match.participants.map((uid) => {
              const checked = attendees.has(uid);
              return (
                <label key={uid} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setAttendees((prev) => {
                        const next = new Set(prev);
                        checked ? next.delete(uid) : next.add(uid);
                        return next;
                      });
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-on-surface font-medium">
                    {uid === user?.uid ? t.matchDetail.you : participantNames[uid] ?? "..."}
                    {uid === match.organizerId && (
                      <span className="ml-1 text-xs text-on-surface-variant">{t.matchDetail.organizerTag}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          {error && (
            <p className="text-sm text-error flex items-center gap-1.5 font-medium mb-3">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" loading={completing} onClick={handleComplete} disabled={attendees.size === 0}>
              {t.matchDetail.complete.replace("{count}", String(attendees.size))}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowComplete(false)}>{t.matchDetail.cancel2}</Button>
          </div>
        </Card>
      )}

      {/* Rating panel */}
      {isCompleted && iAttended && otherAttendees.length > 0 && (
        <Card>
          <h2 className="font-black text-on-surface uppercase tracking-tight text-sm mb-1">{t.matchDetail.ratingTitle}</h2>
          <p className="text-sm text-on-surface-variant mb-4 font-medium">{t.matchDetail.ratingDesc}</p>
          <div className="space-y-4">
            {otherAttendees.map((uid) => {
              const savedScore = myRatings[uid];
              const pendingScore = pendingRatings[uid];
              const displayScore = pendingScore ?? savedScore ?? 0;
              const isSaved = savedScore !== undefined && !pendingRatings[uid];

              return (
                <div key={uid} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{participantNames[uid] ?? "..."}</p>
                    {isSaved && <p className="text-xs text-on-tertiary-container font-bold">{t.matchDetail.rated}</p>}
                  </div>
                  <StarRating value={displayScore} onChange={(score) => {
                    if (isSaved) return;
                    setPendingRatings((prev) => ({ ...prev, [uid]: score }));
                  }} />
                </div>
              );
            })}
          </div>

          {Object.keys(pendingRatings).length > 0 && (
            <div className="mt-4">
              {error && <p className="text-sm text-error flex items-center gap-1.5 font-medium mb-2"><span className="material-symbols-outlined text-[16px]">error</span>{error}</p>}
              <Button size="sm" loading={submittingRating} onClick={handleRatingSubmit}>
                {t.matchDetail.submitRatings}
              </Button>
            </div>
          )}

          {unratedCount === 0 && Object.keys(pendingRatings).length === 0 && (
            <p className="mt-3 text-sm text-on-tertiary-container font-bold">{t.matchDetail.allRated}</p>
          )}
        </Card>
      )}

      {/* Add guest */}
      {isParticipant && !isCancelled && !isCompleted && (
        <Card>
          <h2 className="font-black text-on-surface uppercase tracking-tight text-sm mb-3">{t.matchDetail.addGuest}</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t.matchDetail.guestPlaceholder}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-surface-container text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary border-none placeholder:text-outline-variant"
            />
            <Button size="sm" loading={actionLoading}
              disabled={!guestName.trim() || isFull}
              onClick={() => handle(async () => { await addGuest(match.id, user!.uid, guestName.trim()); setGuestName(""); })}>
              {t.matchDetail.add}
            </Button>
          </div>

          {myGuests.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{t.matchDetail.myGuests}</p>
              {myGuests.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                    {g.name}
                  </span>
                  <button onClick={() => handle(() => removeGuest(match.id, user!.uid, g.id))}
                    className="text-xs text-error hover:underline font-bold">
                    {t.matchDetail.remove}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Participants */}
      <Card>
        <h2 className="font-black text-on-surface uppercase tracking-tight text-sm mb-3">
          {t.matchDetail.participants.replace("{current}", String(match.currentPlayerCount)).replace("{max}", String(match.maxPlayers))}
        </h2>
        <div className="space-y-2 text-sm text-on-surface-variant">
          {match.participants.map((uid) => {
            const attended = match.attendees?.includes(uid);
            return (
              <div key={uid} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  uid === match.organizerId
                    ? "kinetic-gradient text-on-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}>
                  {uid === match.organizerId ? "O" : "·"}
                </span>
                <span className="flex-1 font-medium text-on-surface">
                  {uid === user?.uid ? t.matchDetail.you : participantNames[uid] ?? "..."}
                  {uid === match.organizerId && (
                    <span className="ml-1 text-xs text-on-surface-variant">{t.matchDetail.organizerTag}</span>
                  )}
                </span>
                {isCompleted && (
                  <span className={`text-xs font-bold ${attended ? "text-on-tertiary-container" : "text-outline-variant"}`}>
                    {attended ? t.matchDetail.attended : t.matchDetail.absent}
                  </span>
                )}
              </div>
            );
          })}
          {Object.values(match.guests ?? {}).flat().map((g) => (
            <div key={g.id} className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant">G</span>
              <span className="font-medium">{g.name} {t.matchDetail.guest}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
