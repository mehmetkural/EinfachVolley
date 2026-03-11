// Analytics event wrapper
// Extend with Firebase Analytics calls when ready
import { logger } from "./logger";

type EventName =
  | "sign_in_success"
  | "sign_up_success"
  | "sign_out"
  | "page_view"
  | "support_ticket_submitted"
  | string;

interface EventParams {
  [key: string]: unknown;
}

export function trackEvent(name: EventName, params?: EventParams) {
  logger.info(`[Analytics] ${name}`, params);

  // TODO: Uncomment when Firebase Analytics is configured
  // import { getAnalytics, logEvent } from "firebase/analytics";
  // const analytics = getAnalytics();
  // logEvent(analytics, name, params);
}
