"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface VenueGroup {
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  matches: { id: string; currentPlayerCount: number; maxPlayers: number; date: { toDate: () => Date } }[];
}

interface MatchMapProps {
  venues: VenueGroup[];
  selectedVenue: string | null;
}

// Fix Leaflet default icon path issue with Next.js
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function MatchMap({ venues, selectedVenue }: MatchMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    fixLeafletIcons();

    const firstVenue = venues[0];
    const map = L.map(containerRef.current).setView(
      [firstVenue.latitude, firstVenue.longitude],
      12
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    for (const venue of venues) {
      const marker = L.marker([venue.latitude, venue.longitude])
        .addTo(map)
        .bindPopup(
          `<strong>${venue.venueName}</strong><br/>${venue.matches.length} aktif maç`
        );
      markersRef.current.set(venue.venueName, marker);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to selected venue
  useEffect(() => {
    if (!mapRef.current || !selectedVenue) return;
    const venue = venues.find((v) => v.venueName === selectedVenue);
    if (!venue) return;
    mapRef.current.setView([venue.latitude, venue.longitude], 14, { animate: true });
    markersRef.current.get(selectedVenue)?.openPopup();
  }, [selectedVenue, venues]);

  return <div ref={containerRef} className="h-full w-full" />;
}
