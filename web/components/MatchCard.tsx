import { VolleyMatch } from "@/models/match";
import { Card } from "./Card";

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

export function MatchCard({ match, onJoin, isJoined }: MatchCardProps) {
  const spotsLeft = match.maxPlayers - match.currentPlayerCount;
  const isFull = spotsLeft <= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-base">{match.venueName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {match.venueAddress}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isFull
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}
        >
          {isFull ? "Dolu" : `${spotsLeft} yer`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div>📅 {formatDate(match.date)}</div>
        <div>⏱ {match.duration} saat</div>
        <div>⚥ {genderLabel[match.genderType] ?? match.genderType}</div>
        <div>🏐 Net: {match.netHeight}</div>
        <div>
          💪 Seviye {match.skillLevelMin}–{match.skillLevelMax}
        </div>
        <div>
          💰 {match.pricePerPlayer === 0 ? "Ücretsiz" : `€${match.pricePerPlayer}`}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          👤 {match.currentPlayerCount}/{match.maxPlayers} oyuncu · {match.organizerName}
        </div>
        {onJoin && (
          <button
            onClick={() => onJoin(match.id)}
            disabled={isFull || isJoined}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              isJoined
                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 cursor-default"
                : isFull
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isJoined ? "Katıldın" : "Katıl"}
          </button>
        )}
      </div>
    </Card>
  );
}
