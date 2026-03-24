"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    {
      href: "/matches",
      label: t.nav.matches,
      icon: "sports_volleyball",
    },
    {
      href: "/venues",
      label: t.nav.venues,
      icon: "location_on",
    },
    {
      href: "/store",
      label: t.nav.store,
      icon: "shopping_bag",
    },
    {
      href: "/dashboard",
      label: t.nav.dashboard,
      icon: "monitoring",
    },
    {
      href: "/profile",
      label: t.nav.profile,
      icon: "person",
    },
  ];

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 dark:bg-inverse-surface/80 backdrop-blur-xl border-t border-outline-variant/20">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                active
                  ? "text-primary dark:text-primary-fixed"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
