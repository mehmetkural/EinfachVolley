import { Metadata } from "next";
import { Card } from "@/components/Card";

export const metadata: Metadata = {
  title: "Support — EinfachVolley",
  description: "Get help and support for EinfachVolley",
};

const content = {
  tr: {
    title: "Destek",
    subtitle:
      "Yardım mı gerekiyor? Ekibimiz size en kısa sürede yardımcı olmak için burada.",
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
};

// Server Component — renders Turkish version by default (SEO friendly)
export default function SupportPage() {
  const t = content.tr;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Lang note for users */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">
        🌐 This page is also available in <span className="font-medium">English</span> —
        content below is in Turkish (default).
      </p>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </header>

      <div className="space-y-4">
        {/* Contact */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">{t.contactTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">{t.contactText}</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              E-posta:{" "}
              <a
                href={`mailto:${t.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t.email}
              </a>
            </li>
            <li>
              <span className="text-gray-700 dark:text-gray-300">{t.faqLabel}</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t.response}</p>
        </Card>

        {/* Quick Info */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">{t.infoTitle}</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>{t.version}</li>
            <li>{t.update}</li>
          </ul>
        </Card>

        {/* Policies */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">{t.policyTitle}</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                {t.privacyLabel}
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                {t.termsLabel}
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
            {t.appstore}
          </p>
        </Card>
      </div>

      <footer className="mt-10 text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} EinfachVolley</p>
      </footer>
    </div>
  );
}
