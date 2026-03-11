"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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

function formatDate(ts: { toDate: () => Date }): string {
  return ts.toDate().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const genderLabel: Record<string, string> = { mixed: "Mixed", male: "Erkek", female: "Kadın" };

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
          <span className={(hover || value) >= star ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [match, setMatch] = useState<VolleyMatch | null>(null);
  const [fetching, setFetching] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Participant names
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const fetchedUids = useRef<Set<string>>(new Set());

  // Complete match UI
  const [showComplete, setShowComplete] = useState(false);
  const [attendees, setAttendees] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);

  // Rating UI
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

  // Load my existing ratings when match is completed
  useEffect(() => {
    if (!user || !match || match.status !== "completed") return;
    getMyRatingsForMatch(id, user.uid).then(setMyRatings);
  }, [id, user, match?.status]);

  if (loading || fetching) return <Loader className="mt-20" />;
  if (!match) return (
    <div className="text-center py-20 text-gray-500">
      Maç bulunamadı.{" "}
      <Link href="/matches" className="text-blue-600 hover:underline">Geri dön</Link>
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
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Bir hata oluştu."); }
    finally { setActionLoading(false); }
  }

  async function handleComplete() {
    if (!user) return;
    setCompleting(true);
    try {
      await completeMatch(id, Array.from(attendees));
      setShowComplete(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Tamamlanamadı.");
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
      setError(e instanceof Error ? e.message : "Puan gönderilemedi.");
    } finally {
      setSubmittingRating(false);
    }
  }

  const otherAttendees = (match.attendees ?? []).filter((uid) => uid !== user?.uid);
  const unratedCount = otherAttendees.filter((uid) => !myRatings[uid] && !pendingRatings[uid]).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/matches" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Maçlara Dön
      </Link>

      {/* Status banners */}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 font-medium">
          Bu maç iptal edildi.
        </div>
      )}
      {isCompleted && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
          <span>✓</span>
          <span>Bu maç tamamlandı · {match.attendees?.length ?? 0} katılımcı</span>
        </div>
      )}

      {/* Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{match.venueName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {match.venueAddress}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isFull ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}>
            {isFull ? "Dolu" : `${match.maxPlayers - match.currentPlayerCount} yer kaldı`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
          <div>📅 {formatDate(match.date)}</div>
          <div>⏱ {match.duration} saat</div>
          <div>⚥ {genderLabel[match.genderType] ?? match.genderType}</div>
          <div>🏐 File: {match.netHeight}</div>
          <div>💪 Seviye {match.skillLevelMin}–{match.skillLevelMax}</div>
          <div>💰 {match.pricePerPlayer === 0 ? "Ücretsiz" : `€${match.pricePerPlayer}/kişi`}</div>
          <div>👤 Organizatör: {match.organizerName}</div>
          <div>🧑‍🤝‍🧑 {match.currentPlayerCount}/{match.maxPlayers} oyuncu</div>
        </div>

        {match.notes && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            📝 {match.notes}
          </p>
        )}
      </Card>

      {/* Actions */}
      {!isCancelled && !isCompleted && (
        <Card>
          <h2 className="font-semibold mb-3">İşlemler</h2>
          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}

          <div className="flex flex-wrap gap-2">
            {!isParticipant && !isFull && (
              <Button size="sm" loading={actionLoading}
                onClick={() => handle(() => joinMatch(match.id, user!.uid))}>
                Katıl
              </Button>
            )}
            {isParticipant && !isOrganizer && (
              <Button variant="secondary" size="sm" loading={actionLoading}
                onClick={() => handle(() => leaveMatch(match.id, user!.uid))}>
                Ayrıl
              </Button>
            )}
            {isOrganizer && !matchPassed && (
              <Button variant="danger" size="sm" loading={actionLoading}
                onClick={() => { if (confirm("Maçı iptal etmek istediğine emin misin?")) handle(() => cancelMatch(match.id)); }}>
                Maçı İptal Et
              </Button>
            )}
            {canComplete && (
              <Button size="sm" onClick={() => {
                setAttendees(new Set(match.participants));
                setShowComplete(true);
              }}>
                ✓ Maçı Tamamla
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Complete match panel */}
      {showComplete && (
        <Card>
          <h2 className="font-semibold mb-1">Maçı Tamamla</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Gerçekten katılan oyuncuları seç. Seçilenlerin maç sayısı artar.
          </p>
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
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {uid === user?.uid ? "Sen" : participantNames[uid] ?? "..."}
                    {uid === match.organizerId && <span className="ml-1 text-xs text-gray-400">(organizatör)</span>}
                  </span>
                </label>
              );
            })}
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" loading={completing} onClick={handleComplete}
              disabled={attendees.size === 0}>
              Tamamla ({attendees.size} oyuncu)
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowComplete(false)}>İptal</Button>
          </div>
        </Card>
      )}

      {/* Rating panel — only for completed matches where user attended */}
      {isCompleted && iAttended && otherAttendees.length > 0 && (
        <Card>
          <h2 className="font-semibold mb-1">Oyuncuları Puanla</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Birlikte oynadığın kişileri değerlendir (1–5 yıldız).
          </p>
          <div className="space-y-4">
            {otherAttendees.map((uid) => {
              const savedScore = myRatings[uid];
              const pendingScore = pendingRatings[uid];
              const displayScore = pendingScore ?? savedScore ?? 0;
              const isSaved = savedScore !== undefined && !pendingRatings[uid];

              return (
                <div key={uid} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {participantNames[uid] ?? "..."}
                    </p>
                    {isSaved && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Puanlandı</p>
                    )}
                  </div>
                  <StarRating
                    value={displayScore}
                    onChange={(score) => {
                      if (isSaved) return; // already submitted
                      setPendingRatings((prev) => ({ ...prev, [uid]: score }));
                    }}
                  />
                </div>
              );
            })}
          </div>

          {Object.keys(pendingRatings).length > 0 && (
            <div className="mt-4">
              {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}
              <Button size="sm" loading={submittingRating} onClick={handleRatingSubmit}>
                Puanları Gönder
              </Button>
            </div>
          )}

          {unratedCount === 0 && Object.keys(pendingRatings).length === 0 && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Tüm oyuncuları puanladın.
            </p>
          )}
        </Card>
      )}

      {/* Add guest */}
      {isParticipant && !isCancelled && !isCompleted && (
        <Card>
          <h2 className="font-semibold mb-3">Misafir Ekle</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Misafir adı"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button size="sm" loading={actionLoading}
              disabled={!guestName.trim() || isFull}
              onClick={() => handle(async () => { await addGuest(match.id, user!.uid, guestName.trim()); setGuestName(""); })}>
              Ekle
            </Button>
          </div>

          {myGuests.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Misafirlerim:</p>
              {myGuests.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-sm">
                  <span>👤 {g.name}</span>
                  <button onClick={() => handle(() => removeGuest(match.id, user!.uid, g.id))}
                    className="text-xs text-red-500 hover:text-red-700">
                    Çıkar
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Participants */}
      <Card>
        <h2 className="font-semibold mb-3">
          Katılımcılar ({match.currentPlayerCount}/{match.maxPlayers})
        </h2>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {match.participants.map((uid) => {
            const attended = match.attendees?.includes(uid);
            return (
              <div key={uid} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  uid === match.organizerId
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}>
                  {uid === match.organizerId ? "O" : "•"}
                </span>
                <span className="flex-1">
                  {uid === user?.uid ? "Sen" : participantNames[uid] ?? "..."}
                  {uid === match.organizerId && <span className="ml-1 text-xs text-gray-400">(organizatör)</span>}
                </span>
                {isCompleted && (
                  <span className={`text-xs ${attended ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                    {attended ? "✓ Geldi" : "Gelmedi"}
                  </span>
                )}
              </div>
            );
          })}
          {Object.values(match.guests ?? {}).flat().map((g) => (
            <div key={g.id} className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs">G</span>
              <span>{g.name} (misafir)</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
