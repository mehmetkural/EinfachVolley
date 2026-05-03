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
import { getVenueByName } from "@/services/venues";
import { subscribeToMessages, sendMessage } from "@/services/chat";
import type { ChatMessage } from "@/services/chat";
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

  const [venuePhotos, setVenuePhotos] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "chat" | "teams">("detail");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenMsgLenRef = useRef(0);
  const [playerLevels, setPlayerLevels] = useState<Record<string, number>>({});
  const [teams, setTeams] = useState<{ teamA: string[]; teamB: string[] } | null>(null);

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
            setPlayerLevels((prev) => {
              const next = { ...prev };
              profiles.forEach((p, i) => {
                next[missing[i]] = p?.skillLevel ?? 0;
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

  useEffect(() => {
    if (!match) return;
    getVenueByName(match.venueName).then((v) => {
      if (v?.photoUrls?.length) setVenuePhotos(v.photoUrls);
    });
  }, [match?.venueName]);

  // Always subscribe so we can count unread messages on other tabs
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMessages(id, setMessages);
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.uid]);

  // Track unread messages when not on chat tab
  useEffect(() => {
    if (activeTab === "chat") {
      setUnreadCount(0);
      seenMsgLenRef.current = messages.length;
    } else {
      const newCount = messages.length - seenMsgLenRef.current;
      if (newCount > 0) setUnreadCount(newCount);
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

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

  async function handleShareLink() {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !chatInput.trim()) return;
    setSendingMessage(true);
    try {
      const senderName = participantNames[user.uid] ?? user.displayName ?? user.email ?? "Anonim";
      await sendMessage(id, user.uid, senderName, chatInput.trim());
      setChatInput("");
    } finally {
      setSendingMessage(false);
    }
  }

  // Serpentine draft: sorts by skill desc, alternates A/B in pairs so sums are balanced
  function autoBalance(participants: string[]): { teamA: string[]; teamB: string[] } {
    const sorted = [...participants].sort((a, b) => (playerLevels[b] ?? 0) - (playerLevels[a] ?? 0));
    const teamA: string[] = [];
    const teamB: string[] = [];
    sorted.forEach((uid, i) => {
      const pair = Math.floor(i / 2);
      if (pair % 2 === 0) {
        (i % 2 === 0 ? teamA : teamB).push(uid);
      } else {
        (i % 2 === 0 ? teamB : teamA).push(uid);
      }
    });
    return { teamA, teamB };
  }

  function handleTeamsTab() {
    setActiveTab("teams");
    if (!teams && match) setTeams(autoBalance(match.participants));
  }

  function movePlayer(uid: string, from: "teamA" | "teamB") {
    setTeams((prev) => {
      if (!prev) return prev;
      const to: "teamA" | "teamB" = from === "teamA" ? "teamB" : "teamA";
      return { ...prev, [from]: prev[from].filter((u) => u !== uid), [to]: [...prev[to], uid] };
    });
  }

  const showDetail = activeTab === "detail" || !isParticipant;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {venuePhotos.length > 0 && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden -mt-2">
          <img src={venuePhotos[photoIndex]} alt={match.venueName} className="w-full h-full object-cover" />
          {venuePhotos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex((i) => (i - 1 + venuePhotos.length) % venuePhotos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => setPhotoIndex((i) => (i + 1) % venuePhotos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {venuePhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIndex ? "bg-white" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href="/matches" className="inline-flex items-center gap-1 text-sm text-primary dark:text-primary-fixed hover:underline font-bold">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          {t.matchDetail.backToMatches}
        </Link>
        <button
          onClick={handleShareLink}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-xl hover:bg-surface-container-low dark:hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">{linkCopied ? "check_circle" : "share"}</span>
          {linkCopied ? t.matchDetail.linkCopied : t.matchDetail.shareLink}
        </button>
      </div>

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
            <a
              href={`https://www.google.com/maps?q=${match.latitude},${match.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary dark:text-primary-fixed mt-1 flex items-center gap-1 font-medium underline w-fit"
            >
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {match.venueAddress}
            </a>
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
            {participantNames[match.organizerId] ?? match.organizerName}
          </div>
        </div>

        {match.notes && (
          <p className="mt-4 text-sm text-on-surface-variant bg-surface-container-low dark:bg-surface-container rounded-xl px-4 py-3 font-medium">
            {match.notes}
          </p>
        )}
      </Card>

      {/* Tab switcher — only for participants */}
      {isParticipant && (
        <div className="flex gap-1 bg-surface-container-low dark:bg-surface-container rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("detail")}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
              activeTab === "detail"
                ? "bg-surface-container-lowest dark:bg-inverse-surface text-on-surface dark:text-inverse-on-surface shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            {t.chat.tabDetail}
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`relative flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
              activeTab === "chat"
                ? "bg-surface-container-lowest dark:bg-inverse-surface text-on-surface dark:text-inverse-on-surface shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            {t.chat.tabChat}
            {unreadCount > 0 && activeTab !== "chat" && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleTeamsTab}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
              activeTab === "teams"
                ? "bg-surface-container-lowest dark:bg-inverse-surface text-on-surface dark:text-inverse-on-surface shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            {t.teams.tab}
          </button>
        </div>
      )}

      {/* Actions */}
      {showDetail && !isCancelled && !isCompleted && (
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
      {showDetail && showComplete && (
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
      {showDetail && isCompleted && iAttended && otherAttendees.length > 0 && (
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
      {showDetail && isParticipant && !isCancelled && !isCompleted && (
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
      {showDetail && (
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
      )}

      {/* Chat panel */}
      {activeTab === "chat" && isParticipant && (
        <Card>
          <div className="h-80 overflow-y-auto flex flex-col gap-3 pb-2">
            {messages.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm font-medium py-10">{t.chat.noMessages}</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.senderId === user?.uid ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-on-surface-variant px-1">
                    {msg.senderId === user?.uid ? t.chat.you : msg.senderName}
                    {msg.createdAt && (
                      <span className="ml-1.5 text-outline-variant">
                        {msg.createdAt.toDate().toLocaleTimeString(t.locale, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </span>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm font-medium break-words ${
                    msg.senderId === user?.uid
                      ? "bg-primary text-on-primary rounded-tr-sm"
                      : "bg-surface-container-high dark:bg-surface-container text-on-surface rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-outline-variant/10 mt-1">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chat.placeholder}
              maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-surface-container text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary border-none placeholder:text-outline-variant"
            />
            <Button type="submit" size="sm" loading={sendingMessage} disabled={!chatInput.trim()}>
              {t.chat.send}
            </Button>
          </form>
        </Card>
      )}

      {/* Teams panel */}
      {activeTab === "teams" && isParticipant && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-on-surface uppercase tracking-tight text-sm">{t.teams.title}</h2>
            <button
              onClick={() => setTeams(autoBalance(match.participants))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl kinetic-gradient text-on-primary"
            >
              <span className="material-symbols-outlined text-[14px] [font-style:normal]">shuffle</span>
              {t.teams.autoBalance}
            </button>
          </div>

          {teams && match.participants.length > 0 ? (
            <>
              <p className="text-xs text-on-surface-variant mb-3 font-medium">{t.teams.tip}</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Team A */}
                <div className="bg-primary/5 rounded-2xl p-3">
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>{t.teams.teamA}</span>
                    <span className="text-on-surface-variant font-medium normal-case">
                      ∑{teams.teamA.reduce((s, u) => s + (playerLevels[u] ?? 0), 0)}
                    </span>
                  </p>
                  <div className="space-y-1.5">
                    {teams.teamA.map((uid) => (
                      <button
                        key={uid}
                        onClick={() => movePlayer(uid, "teamA")}
                        className="w-full text-left flex items-center justify-between px-2.5 py-1.5 bg-surface-container-lowest dark:bg-surface-container rounded-xl hover:bg-primary/10 transition-colors"
                      >
                        <span className="text-sm font-medium text-on-surface truncate">
                          {uid === user?.uid ? t.matchDetail.you : participantNames[uid] ?? "..."}
                        </span>
                        <span className="shrink-0 ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                          Sv.{playerLevels[uid] ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team B */}
                <div className="bg-tertiary/5 rounded-2xl p-3">
                  <p className="text-xs font-black text-tertiary uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>{t.teams.teamB}</span>
                    <span className="text-on-surface-variant font-medium normal-case">
                      ∑{teams.teamB.reduce((s, u) => s + (playerLevels[u] ?? 0), 0)}
                    </span>
                  </p>
                  <div className="space-y-1.5">
                    {teams.teamB.map((uid) => (
                      <button
                        key={uid}
                        onClick={() => movePlayer(uid, "teamB")}
                        className="w-full text-left flex items-center justify-between px-2.5 py-1.5 bg-surface-container-lowest dark:bg-surface-container rounded-xl hover:bg-tertiary/10 transition-colors"
                      >
                        <span className="text-sm font-medium text-on-surface truncate">
                          {uid === user?.uid ? t.matchDetail.you : participantNames[uid] ?? "..."}
                        </span>
                        <span className="shrink-0 ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-bold">
                          Sv.{playerLevels[uid] ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-sm text-on-surface-variant font-medium">{t.teams.noParticipants}</p>
          )}
        </Card>
      )}
    </div>
  );
}
