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
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c0 0 2 3 2 9s-2 9-2 9" />
          <path d="M12 3c0 0-2 3-2 9s2 9 2 9" />
          <path d="M3.5 8.5h17M3.5 15.5h17" />
        </svg>
      ),
    },
    {
      href: "/venues",
      label: t.nav.venues,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
          <circle cx="12" cy="8" r="2" />
        </svg>
      ),
    },
    {
      href: "/store",
      label: t.nav.store,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: "/dashboard",
      label: t.nav.dashboard,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <rect x="3" y="13" width="4" height="8" rx="1" />
          <rect x="10" y="9" width="4" height="12" rx="1" />
          <rect x="17" y="4" width="4" height="17" rx="1" />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: t.nav.profile,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <circle cx="12" cy="8" r="4" />
          <path strokeLinecap="round" d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
