// Simple logger utility — wraps console in dev, silent in prod
const isDev = process.env.NEXT_PUBLIC_APP_ENV !== "production";

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.info("[INFO]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn("[WARN]", ...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors
    console.error("[ERROR]", ...args);
  },
};
