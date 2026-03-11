"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface VenueGroup {
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  isPaid: boolean;
  matches: { id: string; currentPlayerCount: number; maxPlayers: number; date: { toDate: () => Date } }[];
}

interface MatchMapProps {
  venues: VenueGroup[];
  selectedVenue: string | null;
  onVenueSelect?: (name: string) => void;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeIcon(hasMatches: boolean) {
  const color = hasMatches ? "#2563eb" : "#6b7280";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 30 12 30S28 21 28 12C28 5.373 22.627 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

function makePopupHtml(venue: VenueGroup): string {
  const matchRows = venue.matches
    .slice(0, 3)
    .map(
      (m) =>
        `<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0;color:#555">
          <span>📅 ${formatDate(m.date.toDate())}</span>
          <span>${m.currentPlayerCount}/${m.maxPlayers}</span>
        </div>`
    )
    .join("");

  const extra =
    venue.matches.length > 3
      ? `<div style="font-size:11px;color:#888;margin-top:2px">+${venue.matches.length - 3} daha</div>`
      : "";

  const noMatch =
    venue.matches.length === 0
      ? `<div style="font-size:12px;color:#999;margin-top:4px">Aktif maç yok</div>`
      : "";

  return `
    <div style="min-width:200px">
      <div style="font-weight:700;font-size:14px;margin-bottom:2px">${venue.venueName}</div>
      <div style="font-size:12px;color:#666;margin-bottom:4px">📍 ${venue.venueAddress}</div>
      <div style="font-size:11px;margin-bottom:8px;display:inline-block;padding:1px 8px;border-radius:20px;background:${venue.isPaid ? "#fef3c7" : "#d1fae5"};color:${venue.isPaid ? "#92400e" : "#065f46"}">${venue.isPaid ? "Ücretli" : "Ücretsiz"}</div>
      ${matchRows}${extra}${noMatch}
    </div>`;
}

export default function MatchMap({ venues, selectedVenue, onVenueSelect }: MatchMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] =
      venues.length > 0 ? [venues[0].latitude, venues[0].longitude] : [49.8988, 10.9028];

    const map = L.map(containerRef.current, { zoomControl: false }).setView(center, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    // Zoom control bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    for (const venue of venues) {
      const marker = L.marker([venue.latitude, venue.longitude], {
        icon: makeIcon(venue.matches.length > 0),
      })
        .addTo(map)
        .bindPopup(makePopupHtml(venue), { maxWidth: 260 });

      marker.on("click", () => {
        onVenueSelect?.(venue.venueName);
      });

      markersRef.current.set(venue.venueName, marker);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker icons when matches change & pan to selected
  useEffect(() => {
    if (!mapRef.current) return;
    for (const venue of venues) {
      const marker = markersRef.current.get(venue.venueName);
      if (marker) {
        marker.setIcon(makeIcon(venue.matches.length > 0));
        marker.setPopupContent(makePopupHtml(venue));
      }
    }
  }, [venues]);

  useEffect(() => {
    if (!mapRef.current || !selectedVenue) return;
    const venue = venues.find((v) => v.venueName === selectedVenue);
    if (!venue) return;
    mapRef.current.setView([venue.latitude, venue.longitude], 15, { animate: true });
    markersRef.current.get(selectedVenue)?.openPopup();
  }, [selectedVenue, venues]);

  return <div ref={containerRef} className="h-full w-full" />;
}
