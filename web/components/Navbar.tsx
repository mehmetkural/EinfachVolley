"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { signOutUser } from "@/firebase/auth";
import type { Locale } from "@/lib/translations";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NAV_LINKS = [
    { href: "/matches", label: t.nav.matches },
    { href: "/venues", label: t.nav.venues },
    { href: "/store", label: t.nav.store },
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/profile", label: t.nav.profile },
  ];

  async function handleSignOut() {
    await signOutUser();
    router.push("/sign-in");
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 dark:bg-inverse-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-xl font-black tracking-tighter text-primary dark:text-primary-fixed uppercase hover:opacity-80 transition-opacity [font-style:italic]"
        >
          EinfachVolley
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {user &&
            NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary dark:text-primary-fixed"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface dark:hover:bg-surface-container"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          {mounted && (
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors border border-outline-variant/30"
                aria-label="Dil seç / Select language / Sprache wählen"
              >
                {locale.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container shadow-lg overflow-hidden z-50">
                  {LOCALES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { setLocale(code); setLangOpen(false); }}
                      className={`w-full px-3 py-2 text-xs font-bold text-left transition-colors ${
                        locale === code
                          ? "bg-primary/10 text-primary dark:text-primary-fixed"
                          : "text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors"
              aria-label="Tema değiştir"
            >
              {resolvedTheme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4.5 h-4.5">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              className="hidden md:block text-sm font-medium text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors"
            >
              {t.nav.signOut}
            </button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-xl hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-bold kinetic-gradient text-on-primary px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-sm shadow-primary/20"
              >
                {t.nav.signUp}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
