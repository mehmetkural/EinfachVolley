"use client";

import { useState } from "react";
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
    response: "Yanıt sürelerimiz genellikle 1-2 iş günüdür.",
    infoTitle: "Hızlı Bilgiler",
    version: "Uygulama sürümü: 1.0.0",
    update: "Son güncelleme: 8 Mart 2026",
    policyTitle: "Politikalar",
    privacyLabel: "Gizlilik Politikası",
    termsLabel: "Kullanım Şartları",
    appstore: "Bu sayfa App Store 'Support URL' alanında kullanılabilir.",
    faqTitle: "Sıkça Sorulan Sorular",
    faqs: [
      {
        q: "Maça nasıl katılabilirim?",
        a: "Maçlar sayfasını aç, sana uygun bir maç bul ve \"Katıl\" butonuna tıkla. Yer kalmadıysa katılım mümkün değildir.",
      },
      {
        q: "Kendi maçımı nasıl oluşturabilirim?",
        a: "Maçlar sayfasının sağ üst köşesindeki \"+ Maç Oluştur\" butonuna tıkla, saha, tarih ve oyuncu sayısı gibi bilgileri doldur.",
      },
      {
        q: "Maçıma misafir ekleyebilir miyim?",
        a: "Evet. Maç detay sayfasının alt kısmındaki \"Misafir Ekle\" bölümünden katılımcı olmayan kişileri ekleyebilirsin.",
      },
      {
        q: "Katıldığım maçtan nasıl ayrılabilirim?",
        a: "Maç detay sayfasına git ve \"Ayrıl\" butonuna tıkla. Maç organizatörü ayrılamaz; bunun yerine maçı iptal etmelisin.",
      },
      {
        q: "Maçı iptal etmek istersem ne yapmalıyım?",
        a: "Yalnızca organizatör maçı iptal edebilir. Maç detay sayfasında \"Maçı İptal Et\" butonu görünür; bu butona tıklayarak onaylayabilirsin.",
      },
      {
        q: "Oyuncu puanlama sistemi nasıl çalışır?",
        a: "Bir maç tamamlandıktan sonra organizatör katılımcıları onaylar. Onaylanan oyuncular birbirini 1–5 yıldız ile puanlayabilir.",
      },
      {
        q: "Uygulama ücretsiz mi?",
        a: "Evet, EinfachVolley tamamen ücretsizdir. Üyelik ücreti veya gizli ücret bulunmamaktadır.",
      },
    ],
  },
  en: {
    title: "Support",
    subtitle: "Need help? Our team is here to assist you.",
    contactTitle: "Contact Us",
    contactText: "You can reach our support team through the following channels:",
    email: "f.mehmetkural@gmail.com",
    response: "Response time is usually 1-2 business days.",
    infoTitle: "Quick Info",
    version: "App version: 1.0.0",
    update: "Last update: March 8, 2026",
    policyTitle: "Policies",
    privacyLabel: "Privacy Policy",
    termsLabel: "Terms of Use",
    appstore: "This page can be used as the App Store Support URL.",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        q: "How do I join a match?",
        a: 'Go to the Matches page, find a suitable match and click "Join". If no spots are available, joining is not possible.',
      },
      {
        q: "How do I create my own match?",
        a: 'Click the "+ Create Match" button in the top right of the Matches page, then fill in the venue, date, and player count.',
      },
      {
        q: "Can I add guests to my match?",
        a: 'Yes. Use the "Add Guest" section at the bottom of the match detail page to add people who are not registered users.',
      },
      {
        q: "How do I leave a match I joined?",
        a: 'Open the match detail page and click "Leave". The match organizer cannot leave — they must cancel the match instead.',
      },
      {
        q: "How do I cancel a match I organized?",
        a: 'Only the organizer can cancel a match. On the match detail page, click "Cancel Match" and confirm.',
      },
      {
        q: "How does the player rating system work?",
        a: "After a match is completed, the organizer confirms who attended. Confirmed players can then rate each other from 1 to 5 stars.",
      },
      {
        q: "Is the app free?",
        a: "Yes, EinfachVolley is completely free. There are no membership fees or hidden charges.",
      },
    ],
  },
  de: {
    title: "Support",
    subtitle: "Brauchen Sie Hilfe? Unser Team ist für Sie da.",
    contactTitle: "Kontakt",
    contactText: "Sie können unser Support-Team über folgende Kanäle erreichen:",
    email: "f.mehmetkural@gmail.com",
    response: "Die Antwortzeit beträgt in der Regel 1-2 Werktage.",
    infoTitle: "Schnellinfo",
    version: "App-Version: 1.0.0",
    update: "Letztes Update: 8. März 2026",
    policyTitle: "Richtlinien",
    privacyLabel: "Datenschutzrichtlinie",
    termsLabel: "Nutzungsbedingungen",
    appstore: "Diese Seite kann als App Store Support-URL verwendet werden.",
    faqTitle: "Häufig gestellte Fragen",
    faqs: [
      {
        q: "Wie nehme ich an einem Spiel teil?",
        a: 'Gehe zur Spieleseite, wähle ein passendes Spiel und klicke auf "Beitreten". Wenn keine Plätze mehr frei sind, ist eine Teilnahme nicht möglich.',
      },
      {
        q: "Wie erstelle ich ein eigenes Spiel?",
        a: 'Klicke auf "+ Spiel erstellen" oben rechts auf der Spieleseite und fülle Halle, Datum und Spieleranzahl aus.',
      },
      {
        q: "Kann ich Gäste zu meinem Spiel hinzufügen?",
        a: 'Ja. Nutze den Bereich "Gast hinzufügen" unten auf der Spieldetailseite, um Personen ohne Konto hinzuzufügen.',
      },
      {
        q: "Wie verlasse ich ein Spiel, dem ich beigetreten bin?",
        a: 'Öffne die Spieldetailseite und klicke auf "Verlassen". Der Organisator kann nicht austreten – er muss das Spiel stattdessen absagen.',
      },
      {
        q: "Wie sage ich ein Spiel ab, das ich organisiert habe?",
        a: 'Nur der Organisator kann ein Spiel absagen. Klicke auf der Spieldetailseite auf "Spiel absagen" und bestätige.',
      },
      {
        q: "Wie funktioniert das Spieler-Bewertungssystem?",
        a: "Nach Abschluss eines Spiels bestätigt der Organisator, wer anwesend war. Die bestätigten Spieler können sich gegenseitig mit 1 bis 5 Sternen bewerten.",
      },
      {
        q: "Ist die App kostenlos?",
        a: "Ja, EinfachVolley ist völlig kostenlos. Es gibt keine Mitgliedsbeiträge oder versteckten Gebühren.",
      },
    ],
  },
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/20 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-left gap-3"
      >
        <span className="text-sm font-bold text-on-surface">{q}</span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          expand_more
        </span>
      </button>
      {open && (
        <p className="text-sm text-on-surface-variant font-medium pb-3 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

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
          </ul>
          <p className="mt-3 text-xs text-outline-variant font-medium">{t.response}</p>
        </Card>

        <Card variant="elevated">
          <h2 className="text-lg font-black text-on-surface uppercase tracking-tight mb-1">{t.faqTitle}</h2>
          <div className="mt-2">
            {t.faqs.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
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
