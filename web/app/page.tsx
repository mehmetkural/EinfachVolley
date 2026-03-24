"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="-mt-8 -mx-4">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-inverse-surface overflow-hidden pt-16">
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-1/2 aspect-square kinetic-gradient rounded-full blur-[140px] opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
            <span className="text-primary-fixed text-xs font-bold uppercase tracking-widest">
              Now accepting waitlist
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] italic uppercase mb-6">
            Volleyball.<br />
            <span className="text-primary-fixed">Simplified.</span>
          </h1>
          <p className="text-xl text-outline-variant max-w-md font-light leading-relaxed mb-10">
            {t.landing.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="kinetic-gradient text-on-primary px-8 py-4 rounded-xl font-bold text-lg text-center hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/30"
            >
              {t.landing.getStarted}
            </Link>
            <Link
              href="/sign-in"
              className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg text-center hover:bg-white/10 transition-all"
            >
              {t.landing.signIn}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 bg-surface dark:bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-primary font-bold uppercase tracking-widest text-xs">The Struggle</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-4 text-on-surface">
              Stop the WhatsApp <span className="text-secondary">Chaos.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "forum",
                color: "text-error",
                bg: "bg-error/10",
                title: t.landing.feature1Title,
                desc: t.landing.feature1Desc,
              },
              {
                icon: "person_off",
                color: "text-error",
                bg: "bg-error/10",
                title: t.landing.feature2Title,
                desc: t.landing.feature2Desc,
              },
              {
                icon: "search_off",
                color: "text-error",
                bg: "bg-error/10",
                title: t.landing.feature3Title,
                desc: t.landing.feature3Desc,
              },
            ].map((f) => (
              <div key={f.title} className="p-8 rounded-3xl bg-surface-container-low dark:bg-surface-container space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center ${f.color}`}>
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">{f.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="py-24 bg-surface-container-low dark:bg-surface-container">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-on-surface">
              Built for the <span className="text-primary">Court.</span>
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Everything you need to run a professional-grade community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[260px]">
            <div className="md:col-span-8 bg-surface-container-lowest dark:bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative group">
              <div className="max-w-sm relative z-10">
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Smart Core</span>
                <h3 className="text-3xl font-bold mt-2 text-on-surface">Dynamic Scheduling</h3>
                <p className="text-on-surface-variant mt-4">One-tap match creation with automated reminders and venue integration.</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[200px] text-primary">calendar_month</span>
              </div>
            </div>
            <div className="md:col-span-4 bg-inverse-surface p-8 rounded-3xl flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl kinetic-gradient flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">check_circle</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Attendance 2.0</h3>
                <p className="text-outline-variant mt-2 text-sm">Real-time RSVP tracking with waitlist automation.</p>
              </div>
            </div>
            <div className="md:col-span-4 bg-tertiary-container/30 dark:bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between">
              <h3 className="text-2xl font-bold text-on-surface">Player Discovery</h3>
              <p className="text-on-surface-variant font-medium">Find local talent that matches your skill level.</p>
              <div className="flex -space-x-2">
                {["🧑", "👩", "👨", "+24"].map((a, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-sm font-bold text-on-surface-variant">
                    {a}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-8 bg-surface-container-highest dark:bg-surface-container-high p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 overflow-hidden">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-on-surface">Stats &amp; History</h3>
                <p className="text-on-surface-variant mt-2">Track your win-rate, MVP awards, and seasonal progression.</p>
              </div>
              <div className="flex-1 w-full bg-surface-container-lowest/60 backdrop-blur rounded-2xl p-4">
                <div className="h-28 flex items-end gap-2">
                  {[40, 70, 55, 90, 45].map((h, i) => (
                    <div key={i} className="flex-1 kinetic-gradient rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-surface dark:bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-inverse-surface rounded-3xl p-12 md:p-20 relative overflow-hidden text-center space-y-8">
            <div className="absolute inset-0 opacity-5 pointer-events-none kinetic-gradient" />
            <div className="relative z-10 space-y-6">
              <span className="text-primary-fixed font-bold uppercase tracking-[0.3em] text-xs">Phase 1: Early Access</span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
                Ready to <span className="text-primary-fixed">Elevate?</span>
              </h2>
              <p className="text-outline-variant text-lg max-w-xl mx-auto leading-relaxed">
                Join the limited group of beta testers and be the first to launch your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/sign-up"
                  className="kinetic-gradient text-on-primary px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  {t.landing.getStarted}
                </Link>
                <Link
                  href="/sign-in"
                  className="bg-white/10 border border-white/10 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/15 transition-all"
                >
                  {t.landing.signIn}
                </Link>
              </div>
              <p className="text-outline-variant text-xs">No spam. Only volleyball updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-black text-white italic uppercase tracking-tight">EinfachVolley</div>
          <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-widest font-light text-outline-variant">
            <Link href="/support" className="hover:text-primary-fixed transition-colors">Support</Link>
            <a href="#" className="hover:text-primary-fixed transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-fixed transition-colors">Terms</a>
          </div>
          <div className="text-xs uppercase tracking-widest font-light text-outline-variant">
            © 2024 EinfachVolley
          </div>
        </div>
      </footer>
    </div>
  );
}
