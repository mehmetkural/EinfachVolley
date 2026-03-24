"use client";

import Link from "next/link";
import { VolleyMatch } from "@/models/match";
import { useLanguage } from "@/contexts/LanguageContext";

interface MatchCardProps {
  match: VolleyMatch;
  onJoin?: (matchId: string) => void;
  isJoined?: boolean;
}

function formatDate(ts: { toDate: () => Date }, locale: string): string {
  return ts.toDate().toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const genderColor: Record<string, string> = {
  mixed: "bg-tertiary-container/40 text-on-tertiary-container",
  male: "bg-secondary-container/50 text-on-secondary-container",
  female: "bg-primary-container/20 text-on-primary-container",
};

export function MatchCard({ match, onJoin, isJoined }: MatchCardProps) {
  const { t } = useLanguage();
  const spotsLeft = match.maxPlayers - match.currentPlayerCount;
  const isFull = spotsLeft <= 0;
  const fillPct = (match.currentPlayerCount / match.maxPlayers) * 100;

  return (
    <Link href={"/matches/" + match.id} className="block group">
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 border border-outline-variant/10 hover:border-primary/20">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1 mr-3">
            <h3 className="font-bold text-on-surface truncate">{match.venueName}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">{match.venueAddress}</p>
          </div>
          <span
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-bold ${
              isFull
                ? "bg-error/10 text-error"
                : spotsLeft <= 3
                ? "bg-primary-fixed/20 text-primary"
                : "bg-tertiary-container/40 text-on-tertiary-container"
            }`}
          >
            {isFull ? t.matchCard.full : t.matchCard.spotsLeft.replace("{count}", String(spotsLeft))}
          </span>
        </div>

        {/* Date + Duration */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          <span className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            {formatDate(match.date, t.locale)}
          </span>
          <span className="text-outline-variant">·</span>
          <span className="text-on-surface-variant text-xs">{match.duration} {t.matchCard.hours}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${genderColor[match.genderType] ?? "bg-surface-container text-on-surface-variant"}`}>
            {t.gender[match.genderType as keyof typeof t.gender] ?? match.genderType}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
            Lv {match.skillLevelMin}–{match.skillLevelMax}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
            {match.pricePerPlayer === 0 ? t.matchCard.free : t.matchCard.perPerson.replace("{price}", String(match.pricePerPlayer))}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
            Net {match.netHeight}
          </span>
        </div>

        {/* Progress + Action */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
              <span>{t.matchCard.players.replace("{current}", String(match.currentPlayerCount)).replace("{max}", String(match.maxPlayers))}</span>
              <span className="text-outline-variant">{match.organizerName}</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? "bg-error" : "kinetic-gradient"}`}
                style={{ width: `${Math.min(fillPct, 100)}%` }}
              />
            </div>
          </div>
          {onJoin && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onJoin(match.id); }}
              disabled={isFull || isJoined}
              className={`shrink-0 text-sm px-4 py-1.5 rounded-xl font-bold transition-all ${
                isJoined
                  ? "bg-tertiary-container/40 text-on-tertiary-container cursor-default"
                  : isFull
                  ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                  : "kinetic-gradient text-on-primary hover:scale-105 shadow-sm shadow-primary/20"
              }`}
            >
              {isJoined ? t.matchCard.joined : t.matchCard.join}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
