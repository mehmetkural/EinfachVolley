"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { getVenues } from "@/services/venues";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Loader } from "@/components/Loader";
import { trackEvent } from "@/lib/analytics";
import type { Venue } from "@/models/venue";

export default function NewMatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const DURATIONS = t.matchNew.durations.map((label, i) => ({
    value: ["1", "1.5", "2", "2.5", "3", "3.5", "4"][i],
    label,
  }));
  const GENDER_TYPES = t.matchNew.genderTypes.map((label, i) => ({
    value: ["mixed", "male", "female"][i],
    label,
  }));
  const NET_HEIGHTS = t.matchNew.netHeights;

  const [form, setForm] = useState({
    date: "",
    time: "",
    duration: "2",
    genderType: "mixed",
    netHeight: NET_HEIGHTS[1],
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
      setError(t.matchNew.errorVenue);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const dateTime = new Date(`${form.date}T${form.time}`);
      if (isNaN(dateTime.getTime())) {
        setError(t.matchNew.errorDate);
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
      setError(err instanceof Error ? err.message : t.matchNew.errorCreate);
    } finally {
      setLoading(false);
    }
  }

  if (venuesLoading) return <Loader className="mt-20" />;

  const sectionClass = "bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 border border-outline-variant/10";
  const sectionTitle = "font-black text-on-surface uppercase tracking-tight text-sm mb-4";
  const chipActive = "kinetic-gradient text-on-primary shadow-sm shadow-primary/20";
  const chipInactive = "bg-surface-container-low dark:bg-surface-container text-on-surface-variant hover:bg-surface-container-high";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase mb-6 pt-2">{t.matchNew.title}</h1>

      {venues.length === 0 ? (
        <div className={`${sectionClass} text-center py-10`}>
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-3 block">location_off</span>
          <p className="font-bold text-on-surface">{t.matchNew.noVenues}</p>
          <p className="text-sm mt-1 text-on-surface-variant">{t.matchNew.noVenuesDesc}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Venue */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>{t.matchNew.selectVenue}</h2>
            <select
              value={selectedVenue?.id ?? ""}
              onChange={(e) => {
                const v = venues.find((v) => v.id === e.target.value) ?? null;
                setSelectedVenue(v);
              }}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low dark:bg-surface-container text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary border-none"
              required
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {selectedVenue && (
              <p className="mt-2 text-xs text-on-surface-variant font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {selectedVenue.address}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>{t.matchNew.dateTime}</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Input id="date" label={t.matchNew.date} type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
              <Input id="time" label={t.matchNew.time} type="time" value={form.time} onChange={(e) => set("time", e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary dark:text-outline-variant uppercase tracking-widest mb-3">{t.matchNew.duration}</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => set("duration", d.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${form.duration === d.value ? chipActive : chipInactive}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>{t.matchNew.settings}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary dark:text-outline-variant uppercase tracking-widest mb-3">{t.matchNew.genderType}</label>
                <div className="flex gap-2">
                  {GENDER_TYPES.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => set("genderType", g.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${form.genderType === g.value ? chipActive : chipInactive}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary dark:text-outline-variant uppercase tracking-widest mb-2">{t.matchNew.netHeight}</label>
                <select
                  value={form.netHeight}
                  onChange={(e) => set("netHeight", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low dark:bg-surface-container text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary border-none"
                >
                  {NET_HEIGHTS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input id="maxPlayers" label={t.matchNew.maxPlayers} type="number" min="2" max="30" value={form.maxPlayers} onChange={(e) => set("maxPlayers", e.target.value)} required />
                <Input id="pricePerPlayer" label={t.matchNew.pricePerPlayer} type="number" min="0" step="0.5" value={form.pricePerPlayer} onChange={(e) => set("pricePerPlayer", e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input id="skillLevelMin" label={t.matchNew.minLevel} type="number" min="1" max="5" value={form.skillLevelMin} onChange={(e) => set("skillLevelMin", e.target.value)} required />
                <Input id="skillLevelMax" label={t.matchNew.maxLevel} type="number" min="1" max="5" value={form.skillLevelMax} onChange={(e) => set("skillLevelMax", e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={sectionClass}>
            <h2 className={sectionTitle}>{t.matchNew.notes}</h2>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder={t.matchNew.notesPlaceholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low dark:bg-surface-container text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none border-none placeholder:text-outline-variant"
            />
          </div>

          {error && (
            <p className="text-sm text-error flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <div className="flex gap-3 pb-4">
            <Button type="submit" className="flex-1" loading={loading}>{t.matchNew.create}</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>{t.matchNew.cancel}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
