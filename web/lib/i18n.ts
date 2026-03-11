// Internationalization configuration for next-intl
// Supported locales: Turkish (tr), English (en), German (de)
export const locales = ["tr", "en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";
