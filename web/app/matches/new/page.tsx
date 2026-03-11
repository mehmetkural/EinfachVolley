"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { getVenues } from "@/services/venues";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";
import { trackEvent } from "@/lib/analytics";
import type { Venue } from "@/models/venue";

const NET_HEIGHTS = ["2.24m (Kadın)", "2.35m (Mixed)", "2.43m (Erkek)"];
const GENDER_TYPES = [
  { value: "mixed", label: "Mixed" },
  { value: "male", label: "Erkek" },
  { value: "female", label: "Kadın" },
];

export default function NewMatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const [form, setForm] = useState({
    date: "",
    time: "",
    duration: "2",
    genderType: "mixed",
    netHeight: "2.35m (Mixed)",
    maxPlayers: "12",
    skillLevelMin: "1",
    skillLevelMax: "5",
    pricePerPlayer: "0",
    notes: "",
  });

  useEffect(() => {
    getVenues()
      .then((v) => {
        setVenues(v);
        if (v.length > 0) setSelectedVenue(v[0]);
      })
      .finally(() => setVenuesLoading(false));
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!selectedVenue) {
      setError("Lütfen bir saha seçin.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const dateTime = new Date(`${form.date}T${form.time}`);
      if (isNaN(dateTime.getTime())) {
        setError("Geçerli bir tarih ve saat girin.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "matches"), {
        venueName: selectedVenue.name,
        venueAddress: selectedVenue.address,
        latitude: selectedVenue.latitude,
        longitude: selectedVenue.longitude,
        date: Timestamp.fromDate(dateTime),
        duration: parseFloat(form.duration),
        genderType: form.genderType,
        netHeight: form.netHeight,
        maxPlayers: parseInt(form.maxPlayers),
        currentPlayerCount: 1,
        skillLevelMin: parseInt(form.skillLevelMin),
        skillLevelMax: parseInt(form.skillLevelMax),
        pricePerPlayer: parseFloat(form.pricePerPlayer),
        notes: form.notes,
        organizerId: user.uid,
        organizerName: user.displayName ?? user.email ?? "Anonim",
        participants: [user.uid],
        guests: {},
        status: "active",
        createdAt: serverTimestamp(),
      });

      trackEvent("match_created");
      router.push("/matches");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Maç oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  }

  if (venuesLoading) return <Loader className="mt-20" />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Yeni Maç Oluştur</h1>

      {venues.length === 0 ? (
        <Card className="text-center py-10 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">📍</div>
          <p className="font-medium">Henüz saha eklenmemiş.</p>
          <p className="text-sm mt-1">Maç oluşturmak için önce bir admin saha eklemeli.</p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Venue selector */}
          <Card>
            <h2 className="font-semibold mb-4">📍 Saha Seç</h2>
            <select
              value={selectedVenue?.id ?? ""}
              onChange={(e) => {
                const v = venues.find((v) => v.id === e.target.value) ?? null;
                setSelectedVenue(v);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {selectedVenue && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                📍 {selectedVenue.address}
              </p>
            )}
          </Card>

          {/* Date & Time */}
          <Card>
            <h2 className="font-semibold mb-4">📅 Tarih ve Süre</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="date"
                label="Tarih"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
              <Input
                id="time"
                label="Saat"
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                required
              />
              <Input
                id="duration"
                label="Süre (saat)"
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                required
              />
            </div>
          </Card>

          {/* Match settings */}
          <Card>
            <h2 className="font-semibold mb-4">⚙️ Maç Ayarları</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cinsiyet Türü
                </label>
                <div className="flex gap-2">
                  {GENDER_TYPES.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => set("genderType", g.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.genderType === g.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Yüksekliği
                </label>
                <select
                  value={form.netHeight}
                  onChange={(e) => set("netHeight", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NET_HEIGHTS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="maxPlayers"
                  label="Maks. Oyuncu"
                  type="number"
                  min="2"
                  max="30"
                  value={form.maxPlayers}
                  onChange={(e) => set("maxPlayers", e.target.value)}
                  required
                />
                <Input
                  id="pricePerPlayer"
                  label="Kişi Başı Ücret (€)"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.pricePerPlayer}
                  onChange={(e) => set("pricePerPlayer", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="skillLevelMin"
                  label="Min. Seviye (1-5)"
                  type="number"
                  min="1"
                  max="5"
                  value={form.skillLevelMin}
                  onChange={(e) => set("skillLevelMin", e.target.value)}
                  required
                />
                <Input
                  id="skillLevelMax"
                  label="Maks. Seviye (1-5)"
                  type="number"
                  min="1"
                  max="5"
                  value={form.skillLevelMax}
                  onChange={(e) => set("skillLevelMax", e.target.value)}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h2 className="font-semibold mb-4">📝 Notlar</h2>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Ek bilgiler, ekipman, uyarılar..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </Card>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" loading={loading}>
              Maç Oluştur
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              İptal
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
