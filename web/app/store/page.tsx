import { Metadata } from "next";
import { AdBanner } from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Mağaza — EinfachVolley",
  description: "Voleybol ekipmanları ve ürünleri",
};

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

// Replace affiliate tag "einfachvolley-21" with your real Amazon Associates tag
const AMAZON_TAG = "einfachvolley-21";

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mikasa V200W Maç Topu",
    description: "FIVB onaylı resmi maç topu. Profesyonel deri yüzey, mükemmel tutuş.",
    price: "~€110",
    badge: "En Çok Satan",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    emoji: "🏐",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Mikasa+V200W&tag=${AMAZON_TAG}`,
    category: "Top",
  },
  {
    id: "2",
    name: "Molten V5M5000 Antrenman Topu",
    description: "Dayanıklı antrenman topu, iç ve dış mekan kullanımına uygun.",
    price: "~€45",
    emoji: "🏐",
    store: "amazon",
    url: `https://www.amazon.de/s?k=Molten+V5M5000&tag=${AMAZON_TAG}`,
    category: "Top",
  },
  {
    id: "3",
    name: "Asics Gel-Task 3 Voleybol Ayakkabısı",
    description: "Hafif ve duyarlı. Kort içi hızlı hareketler için tasarlandı.",
    price: "~€75",
    badge: "Popüler",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
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
    name: "Taktik Parmak Bandı",
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
    name: "Sporttasche Voleybol Çantası",
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
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
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

const CATEGORIES = ["Tümü", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

export default function StorePage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Mağaza</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Voleybol ekipmanları · Amazon & Decathlon üzerinden güvenli alışveriş
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          * Bağlı kuruluş bağlantıları — satın alımlarda küçük bir komisyon kazanıyoruz, sana ek maliyet yok.
        </p>
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
            className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 flex flex-col"
          >
            {/* Emoji + badge row */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-3xl">
                {product.emoji}
              </div>
              <div className="flex flex-col items-end gap-1">
                {product.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.badgeColor}`}>
                    {product.badge}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Info */}
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
              {product.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-gray-100">{product.price}</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <span>{product.store === "amazon" ? "Amazon'da Gör" : "Decathlon'da Gör"}</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>

      <AdBanner format="horizontal" className="mt-10" />

      {/* Affiliate disclaimer */}
      <p className="mt-8 mb-4 text-xs text-center text-gray-400 dark:text-gray-600">
        EinfachVolley, Amazon ve Decathlon bağlı kuruluş programlarına katılmaktadır.
        Bu sayfadaki bağlantılar aracılığıyla yapılan alışverişlerden komisyon kazanabiliriz.
      </p>
    </div>
  );
}
