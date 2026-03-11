"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDocument } from "@/services/firestore";
import { subscribeToVenues, addVenue } from "@/services/venues";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Loader } from "@/components/Loader";
import type { Venue } from "@/models/venue";
import type { UserProfile } from "@/models/user";

export default function AdminVenuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
      return;
    }
    if (!user) return;

    // Check admin status
    getDocument<UserProfile>("users", user.uid).then((profile) => {
      if (!profile?.isAdmin) {
        router.push("/");
        return;
      }
      setIsAdmin(true);
      setChecking(false);
    });
  }, [user, loading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    return subscribeToVenues((v) => setVenues(v));
  }, [isAdmin]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await addVenue({
        name: form.name,
        address: form.address,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
        createdBy: user.uid,
      });
      setSuccess(`"${form.name}" eklendi.`);
      setForm({ name: "", address: "", latitude: "", longitude: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || checking) return <Loader className="mt-20" />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-medium">
          Admin
        </span>
        <h1 className="text-3xl font-bold">Saha Yönetimi</h1>
      </div>

      {/* Add venue form */}
      <Card className="mb-6">
        <h2 className="font-semibold mb-4">Yeni Saha Ekle</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <Input
            id="name"
            label="Saha Adı"
            placeholder="ör. Erba Park Beach"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <Input
            id="address"
            label="Adres"
            placeholder="ör. Galgenfuhr 30, 96050 Bamberg"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="latitude"
              label="Enlem"
              placeholder="ör. 49.8923"
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
            />
            <Input
              id="longitude"
              label="Boylam"
              placeholder="ör. 10.9026"
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">✓ {success}</p>}

          <Button type="submit" loading={saving}>
            Saha Ekle
          </Button>
        </form>
      </Card>

      {/* Venue list */}
      <h2 className="font-semibold mb-3">Mevcut Sahalar ({venues.length})</h2>
      {venues.length === 0 ? (
        <Card className="text-center py-8 text-gray-500 dark:text-gray-400">
          Henüz saha eklenmemiş.
        </Card>
      ) : (
        <div className="space-y-3">
          {venues.map((v) => (
            <Card key={v.id}>
              <div className="font-medium">{v.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                📍 {v.address}
              </div>
              {(v.latitude !== 0 || v.longitude !== 0) && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {v.latitude}, {v.longitude}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
