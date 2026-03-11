"use client";

interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
}

const SIZE: Record<string, { w: string; h: string; label: string }> = {
  horizontal: { w: "w-full max-w-2xl", h: "h-24", label: "728×90 — Leaderboard" },
  rectangle:  { w: "w-72",             h: "h-60", label: "300×250 — Rectangle" },
  vertical:   { w: "w-36",             h: "h-64", label: "160×600 — Skyscraper" },
};

export function AdBanner({ slot, format = "horizontal", className = "" }: AdBannerProps) {
  const isDev = process.env.NODE_ENV === "development" || !slot;

  if (isDev) {
    const s = SIZE[format];
    return (
      <div
        className={`${s.w} ${s.h} ${className} mx-auto flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50`}
      >
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Reklam Alanı
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">{s.label}</p>
        </div>
      </div>
    );
  }

  // Production: real AdSense unit
  return (
    <div className={`${className} overflow-hidden`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
