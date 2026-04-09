"use client";

import { Card } from "@/components/Card";
import { AdBanner } from "@/components/AdBanner";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  tr: {
    title: "Destek",
    subtitle: "Yardım mı gerekiyor? Ekibimiz size en kısa sürede yardımcı olmak için burada.",
    contactTitle: "Bize Ulaşın",
    contactText: "Destek ekibimize aşağıdaki kanallardan ulaşabilirsiniz:",
    email: "f.mehmetkural@gmail.com",
    faqLabel: "Sıkça Sorulan Sorular",
    response: "Yanıt sürelerimiz genellikle 1-2 iş günüdür.",
    infoTitle: "Hızlı Bilgiler",
    version: "Uygulama sürümü: 1.0.0",
    update: "Son güncelleme: 8 Mart 2026",
    policyTitle: "Politikalar",
    privacyLabel: "Gizlilik Politikası",
    termsLabel: "Kullanım Şartları",
    appstore: "Bu sayfa App Store 'Support URL' alanında kullanılabilir.",
  },
  en: {
    title: "Support",
    subtitle: "Need help? Our team is here to assist you.",
    contactTitle: "Contact Us",
    contactText: "You can reach our support team through the following channels:",
    email: "f.mehmetkural@gmail.com",
    faqLabel: "Frequently Asked Questions",
    response: "Response time is usually 1-2 business days.",
    infoTitle: "Quick Info",
    version: "App version: 1.0.0",
    update: "Last update: March 8, 2026",
    policyTitle: "Policies",
    privacyLabel: "Privacy Policy",
    termsLabel: "Terms of Use",
    appstore: "This page can be used as the App Store Support URL.",
  },
  de: {
    title: "Support",
    subtitle: "Brauchen Sie Hilfe? Unser Team ist für Sie da.",
    contactTitle: "Kontakt",
    contactText: "Sie können unser Support-Team über folgende Kanäle erreichen:",
    email: "f.mehmetkural@gmail.com",
    faqLabel: "Häufig gestellte Fragen",
    response: "Die Antwortzeit beträgt in der Regel 1-2 Werktage.",
    infoTitle: "Schnellinfo",
    version: "App-Version: 1.0.0",
    update: "Letztes Update: 8. März 2026",
    policyTitle: "Richtlinien",
    privacyLabel: "Datenschutzrichtlinie",
    termsLabel: "Nutzungsbedingungen",
    appstore: "Diese Seite kann als App Store Support-URL verwendet werden.",
  },
};

export default function SupportPage() {
  const { locale } = useLanguage();
  const t = content[locale] ?? content.en;

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 pt-2">
        <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase mb-2">{t.title}</h1>
        <p className="text-on-surface-variant font-medium">{t.subtitle}</p>
      </header>

      <div className="space-y-4">
        <Card variant="elevated">
          <h2 className="text-lg font-black text-on-surface uppercase tracking-tight mb-3">{t.contactTitle}</h2>
          <p className="text-on-surface-variant mb-3 text-sm font-medium">{t.contactText}</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
              <a href={`mailto:${t.email}`} className="text-primary dark:text-primary-fixed hover:underline font-bold">
                {t.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">help</span>
              <span className="text-on-surface-variant font-medium">{t.faqLabel}</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-outline-variant font-medium">{t.response}</p>
        </Card>

        <Card variant="elevated">
          <h2 className="text-lg font-black text-on-surface uppercase tracking-tight mb-3">{t.infoTitle}</h2>
          <ul className="space-y-2 text-sm text-on-surface-variant font-medium">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-tertiary">info</span>
              {t.version}
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-tertiary">update</span>
              {t.update}
            </li>
          </ul>
        </Card>

        <Card variant="elevated">
          <h2 className="text-lg font-black text-on-surface uppercase tracking-tight mb-3">{t.policyTitle}</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">privacy_tip</span>
              <a href="#" className="text-primary dark:text-primary-fixed hover:underline font-bold">{t.privacyLabel}</a>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">gavel</span>
              <a href="#" className="text-primary dark:text-primary-fixed hover:underline font-bold">{t.termsLabel}</a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-outline-variant italic font-medium">{t.appstore}</p>
        </Card>
      </div>

      <AdBanner format="horizontal" className="mt-8" />

      <footer className="mt-8 text-xs text-outline-variant font-medium">
        <p>© {new Date().getFullYear()} EinfachVolley</p>
      </footer>
    </div>
  );
}
