import Link from "next/link";
import { VolleyMatch } from "@/models/match";

interface MatchCardProps {
  match: VolleyMatch;
  onJoin?: (matchId: string) => void;
  isJoined?: boolean;
}

function formatDate(ts: { toDate: () => Date }): string {
  return ts.toDate().toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const genderLabel: Record<string, string> = {
  mixed: "Mixed",
  male: "Erkek",
  female: "Kadın",
};

const genderColor: Record<string, string> = {
  mixed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  male: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  female: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export function MatchCard({ match, onJoin, isJoined }: MatchCardProps) {
  const spotsLeft = match.maxPlayers - match.currentPlayerCount;
  const isFull = spotsLeft <= 0;
  const fillPct = (match.currentPlayerCount / match.maxPlayers) * 100;

  return (
    <Link href={"/matches/" + match.id} className="block group">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1 mr-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{match.venueName}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{match.venueAddress}</p>
          </div>
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${
            isFull
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : spotsLeft <= 3
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}>
            {isFull ? "Dolu" : `${spotsLeft} yer kaldı`}
          </span>
        </div>

        {/* Date + Duration row */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(match.date)}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">{match.duration} saat</span>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genderColor[match.genderType] ?? "bg-gray-100 text-gray-600"}`}>
            {genderLabel[match.genderType] ?? match.genderType}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
            Lv {match.skillLevelMin}–{match.skillLevelMax}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
            {match.pricePerPlayer === 0 ? "Ücretsiz" : `€${match.pricePerPlayer}/kişi`}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
            Net {match.netHeight}
          </span>
        </div>

        {/* Player progress bar + action */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{match.currentPlayerCount}/{match.maxPlayers} oyuncu</span>
              <span className="text-gray-400">{match.organizerName}</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? "bg-red-400" : "bg-blue-500"}`}
                style={{ width: `${Math.min(fillPct, 100)}%` }}
              />
            </div>
          </div>
          {onJoin && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onJoin(match.id); }}
              disabled={isFull || isJoined}
              className={`shrink-0 text-sm px-4 py-1.5 rounded-xl font-semibold transition-colors ${
                isJoined
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default"
                  : isFull
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              {isJoined ? "✓ Katıldın" : "Katıl"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
