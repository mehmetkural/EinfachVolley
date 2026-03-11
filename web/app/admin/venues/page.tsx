"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDocument } from "@/services/firestore";
import { subscribeToVenues, addVenue, updateVenue, deleteVenue } from "@/services/venues";
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
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    isPaid: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", latitude: "", longitude: "", isPaid: false });
  const [editSaving, setEditSaving] = useState(false);

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

  // Parse the txt format: Name/Address/Latitude/Longitude blocks separated by ---
  function parseVenueText(text: string) {
    return text
      .split("---")
      .map((block) => {
        const lines: Record<string, string> = {};
        block.trim().split("\n").forEach((line) => {
          const idx = line.indexOf(":");
          if (idx === -1) return;
          const key = line.slice(0, idx).trim().toLowerCase();
          const val = line.slice(idx + 1).trim();
          lines[key] = val;
        });
        if (!lines["name"] || !lines["address"]) return null;
        return {
          name: lines["name"],
          address: lines["address"],
          latitude: parseFloat(lines["latitude"]) || 0,
          longitude: parseFloat(lines["longitude"]) || 0,
        };
      })
      .filter(Boolean) as { name: string; address: string; latitude: number; longitude: number }[];
  }

  async function handleImport() {
    if (!user || !importText.trim()) return;
    setImporting(true);
    setImportResult("");
    const parsed = parseVenueText(importText);
    if (parsed.length === 0) {
      setImportResult("❌ Geçerli saha bulunamadı. Formatı kontrol et.");
      setImporting(false);
      return;
    }
    // Skip venues that already exist (by name)
    const existingNames = new Set(venues.map((v) => v.name.toLowerCase()));
    const toAdd = parsed.filter((v) => !existingNames.has(v.name.toLowerCase()));
    try {
      await Promise.all(toAdd.map((v) => addVenue({ ...v, createdBy: user.uid })));
      const skipped = parsed.length - toAdd.length;
      setImportResult(
        `✓ ${toAdd.length} saha eklendi${skipped > 0 ? `, ${skipped} zaten vardı` : ""}.`
      );
      setImportText("");
    } catch (err: unknown) {
      setImportResult(`❌ ${err instanceof Error ? err.message : "Hata oluştu."}`);
    } finally {
      setImporting(false);
    }
  }

  async function handleDelete(v: Venue) {
    if (!confirm(`"${v.name}" silinsin mi?`)) return;
    try {
      await deleteVenue(v.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Silinemedi.");
    }
  }

  async function handleEditSave(id: string) {
    setEditSaving(true);
    try {
      await updateVenue(id, {
        name: editForm.name,
        address: editForm.address,
        latitude: parseFloat(editForm.latitude) || 0,
        longitude: parseFloat(editForm.longitude) || 0,
        isPaid: editForm.isPaid,
      });
      setEditingId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Güncellenemedi.");
    } finally {
      setEditSaving(false);
    }
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
        isPaid: form.isPaid,
        createdBy: user.uid,
      });
      setSuccess(`"${form.name}" eklendi.`);
      setForm({ name: "", address: "", latitude: "", longitude: "", isPaid: false });
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

      {/* Bulk import */}
      <Card className="mb-6">
        <h2 className="font-semibold mb-1">Toplu Import</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Aşağıdaki formatta sahalar yapıştır, otomatik parse eder. Zaten var olanları atlar.
        </p>
        <pre className="text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 text-gray-500 dark:text-gray-400 overflow-x-auto">
{`Name: Erba Park Beach
Address: Galgenfuhr 30, 96050 Bamberg
Latitude: 49.892300
Longitude: 10.902600
---
Name: Sportzentrum XYZ
Address: Musterstraße 1, 12345 Stadt
Latitude: 49.900000
Longitude: 10.910000`}
        </pre>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={6}
          placeholder="Saha listesini buraya yapıştır..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
        />
        {importResult && (
          <p className={`text-sm mb-3 ${importResult.startsWith("✓") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {importResult}
          </p>
        )}
        <Button size="sm" loading={importing} onClick={handleImport} disabled={!importText.trim()}>
          İçe Aktar
        </Button>
      </Card>

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

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm((f) => ({ ...f, isPaid: !f.isPaid }))}
              className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${form.isPaid ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPaid ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{form.isPaid ? "Ücretli Saha" : "Ücretsiz Saha"}</span>
          </label>

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
          {venues.map((v) =>
            editingId === v.id ? (
              <Card key={v.id}>
                <div className="space-y-2">
                  <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Saha Adı" />
                  <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} placeholder="Adres" />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" value={editForm.latitude} onChange={(e) => setEditForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="Enlem" />
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" value={editForm.longitude} onChange={(e) => setEditForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="Boylam" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <div
                      onClick={() => setEditForm((f) => ({ ...f, isPaid: !f.isPaid }))}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${editForm.isPaid ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isPaid ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{editForm.isPaid ? "Ücretli" : "Ücretsiz"}</span>
                  </label>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" loading={editSaving} onClick={() => handleEditSave(v.id)}>Kaydet</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>İptal</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card key={v.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{v.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${v.isPaid ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
                        {v.isPaid ? "Ücretli" : "Ücretsiz"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">📍 {v.address}</div>
                    {(v.latitude !== 0 || v.longitude !== 0) && (
                      <div className="text-xs text-gray-400 mt-0.5">{v.latitude}, {v.longitude}</div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => { setEditingId(v.id); setEditForm({ name: v.name, address: v.address, latitude: String(v.latitude), longitude: String(v.longitude), isPaid: v.isPaid ?? false }); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Düzenle</button>
                    <button onClick={() => handleDelete(v)} className="text-xs text-red-500 hover:underline">Sil</button>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
