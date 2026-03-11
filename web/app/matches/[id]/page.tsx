"use client";

import { useEffect, useState } from "react";
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
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import type { VolleyMatch } from "@/models/match";

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

const genderLabel: Record<string, string> = {
  mixed: "Mixed",
  male: "Erkek",
  female: "Kadın",
};

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<VolleyMatch | null>(null);
  const [fetching, setFetching] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;
    const unsub = subscribeToMatch(id, (m) => {
      setMatch(m);
      setFetching(false);
    });
    return unsub;
  }, [id, user, loading, router]);

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
  const myGuests = user ? (match.guests?.[user.uid] ?? []) : [];

  async function handle(fn: () => Promise<void>) {
    setActionLoading(true);
    setError("");
    try {
      await fn();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back */}
      <Link href="/matches" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Maçlara Dön
      </Link>

      {/* Status banner */}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 font-medium">
          Bu maç iptal edildi.
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
      {!isCancelled && (
        <Card>
          <h2 className="font-semibold mb-3">İşlemler</h2>
          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}

          <div className="flex flex-wrap gap-2">
            {!isParticipant && !isFull && (
              <Button
                size="sm"
                loading={actionLoading}
                onClick={() => handle(() => joinMatch(match.id, user!.uid))}
              >
                Katıl
              </Button>
            )}
            {isParticipant && !isOrganizer && (
              <Button
                variant="secondary"
                size="sm"
                loading={actionLoading}
                onClick={() => handle(() => leaveMatch(match.id, user!.uid))}
              >
                Ayrıl
              </Button>
            )}
            {isOrganizer && (
              <Button
                variant="danger"
                size="sm"
                loading={actionLoading}
                onClick={() => {
                  if (confirm("Maçı iptal etmek istediğine emin misin?")) {
                    handle(() => cancelMatch(match.id));
                  }
                }}
              >
                Maçı İptal Et
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Add guest */}
      {isParticipant && !isCancelled && (
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
            <Button
              size="sm"
              loading={actionLoading}
              disabled={!guestName.trim() || isFull}
              onClick={() =>
                handle(async () => {
                  await addGuest(match.id, user!.uid, guestName.trim());
                  setGuestName("");
                })
              }
            >
              Ekle
            </Button>
          </div>

          {myGuests.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Misafirlerim:</p>
              {myGuests.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-sm">
                  <span>👤 {g.name}</span>
                  <button
                    onClick={() => handle(() => removeGuest(match.id, user!.uid, g.id))}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
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
        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {match.participants.map((uid) => (
            <div key={uid} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                {uid === match.organizerId ? "O" : "•"}
              </span>
              <span>{uid === user?.uid ? "Sen" : uid === match.organizerId ? match.organizerName : `Oyuncu`}</span>
            </div>
          ))}
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
