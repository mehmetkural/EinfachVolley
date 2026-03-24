"use client";

import { AdBanner } from "@/components/AdBanner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  emoji: string;
  store: "amazon" | "decathlon";
  url: string;
  category: string;
}

const AMAZON_TAG = "einfachvolley-21";

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mikasa V200W",
    description: "FIVB onaylı resmi maç topu. Profesyonel deri yüzey, mükemmel tutuş.",
    price: "~€110",
    badge: "En Çok Satan",
    badgeColor: "bg-primary-fixed/20 text-primary",
    emoji: "🏐",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Mikasa+V200W&tag=${AMAZON_TAG}`,
    category: "Top",
  },
  {
    id: "2",
    name: "Molten V5M5000",
    description: "Dayanıklı antrenman topu, iç ve dış mekan kullanımına uygun.",
    price: "~€45",
    emoji: "🏐",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Molten+V5M5000&tag=${AMAZON_TAG}`,
    category: "Top",
  },
  {
    id: "3",
    name: "Asics Gel-Task 3",
    description: "Hafif ve duyarlı. Kort içi hızlı hareketler için tasarlandı.",
    price: "~€75",
    badge: "Popüler",
    badgeColor: "bg-secondary-container text-on-secondary-container",
    emoji: "👟",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Asics+Gel-Task+Volleyball&tag=${AMAZON_TAG}`,
    category: "Ayakkabı",
  },
  {
    id: "4",
    name: "Mizuno Wave Lightning Z7",
    description: "Profesyonel voleybolcuların tercihi. Üstün çevik performans.",
    price: "~€110",
    emoji: "👟",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Mizuno+Wave+Lightning+Z7&tag=${AMAZON_TAG}`,
    category: "Ayakkabı",
  },
  {
    id: "5",
    name: "Mizuno Diz Koruyucu",
    description: "Profesyonel diz koruyucu, uzun oyun seansları için konfor.",
    price: "~€30",
    emoji: "🦵",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Mizuno+Volleyball+Kneepads&tag=${AMAZON_TAG}`,
    category: "Koruyucu",
  },
  {
    id: "6",
    name: "Taktik Finger Tape",
    description: "Voleybol parmak koruyucu bant, 3'lü paket.",
    price: "~€8",
    emoji: "🩹",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Volleyball+Finger+Tape&tag=${AMAZON_TAG}`,
    category: "Koruyucu",
  },
  {
    id: "7",
    name: "Mizuno Voleybol Forması",
    description: "Nefes alabilen kumaş, hızlı kuruma teknolojisi.",
    price: "~€35",
    emoji: "👕",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Mizuno+Volleyball+Jersey&tag=${AMAZON_TAG}`,
    category: "Forma",
  },
  {
    id: "8",
    name: "Volleyball Sporttasche",
    description: "Top bölmeli voleybol çantası, tüm ekipmanlarına yeter.",
    price: "~€40",
    emoji: "🎒",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Volleyball+Sporttasche&tag=${AMAZON_TAG}`,
    category: "Aksesuar",
  },
  {
    id: "9",
    name: "Decathlon Taşınabilir File",
    description: "Kurulumu kolay taşınabilir voleybol filesi, plaj ve park için.",
    price: "~€55",
    badge: "Plaj",
    badgeColor: "bg-tertiary-container/40 text-on-tertiary-container",
    emoji: "🏖️",
    store: "decathlon",
    url: "https://www.decathlon.de/browse/c0-alle-sportarten/c1-volleyball/_/N-1nk",
    category: "Ekipman",
  },
  {
    id: "10",
    name: "Voleybol Antrenman Seti",
    description: "Top + file + pompa içeren başlangıç seti. Bamberg sahalarında hazır oyna.",
    price: "~€50",
    emoji: "📦",
    store: "decathlon",
    url: "https://www.decathlon.de/browse/c0-alle-sportarten/c1-volleyball/_/N-1nk",
    category: "Ekipman",
  },
];

export default function StorePage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-2">
        <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase">{t.store.title}</h1>
        <p className="text-on-surface-variant mt-1 text-sm font-medium">{t.store.subtitle}</p>
        <p className="text-xs text-outline-variant mt-1">{t.store.affiliateNote}</p>
      </div>

      <AdBanner format="horizontal" className="mb-8" />

      {/* Product grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCTS.map((product) => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 flex flex-col border border-outline-variant/10 hover:border-primary/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-surface-container-low dark:bg-surface-container-high rounded-2xl flex items-center justify-center text-3xl">
                {product.emoji}
              </div>
              <div className="flex flex-col items-end gap-1">
                {product.badge && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${product.badgeColor}`}>
                    {product.badge}
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">
                  {product.category}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-on-surface mb-1 group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{product.description}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
              <span className="font-black text-on-surface">{product.price}</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-primary dark:text-primary-fixed">
                <span>{product.store === "amazon" ? t.store.viewOnAmazon : t.store.viewOnDecathlon}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_outward</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <AdBanner format="horizontal" className="mt-10" />

      <p className="mt-8 mb-4 text-xs text-center text-outline-variant">
        {t.store.affiliateDisclaimer}
      </p>
    </div>
  );
}
