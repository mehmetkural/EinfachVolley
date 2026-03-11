import Link from "next/link";
import { Button } from "@/components/Button";
import { AdBanner } from "@/components/AdBanner";

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center py-20 md:py-28">
        {/* Volleyball icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-blue-900/40">
            <svg viewBox="0 0 48 48" fill="none" className="w-11 h-11" stroke="white" strokeWidth={2}>
              <circle cx="24" cy="24" r="20" />
              <path d="M24 4c0 0 4 6 4 20s-4 20-4 20" />
              <path d="M24 4c0 0-4 6-4 20s4 20 4 20" />
              <path d="M5 15h38M5 33h38" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-5 text-gray-900 dark:text-gray-100">
          Volleyball Games in{" "}
          <span className="text-blue-600 dark:text-blue-400">Bamberg</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Find the closest volleyball game to you, join in, and have fun.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/sign-up">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="secondary" size="lg">Sign In</Button>
          </Link>
        </div>
      </section>

      {/* Ad — below hero */}
      <AdBanner format="horizontal" className="mb-10" />

      {/* Features */}
      <section className="py-10 grid md:grid-cols-3 gap-5 pb-20">
        {[
          {
            title: "Find a Game",
            description: "Browse upcoming matches near you and see who's playing in real time.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
                <circle cx="12" cy="8" r="2" />
              </svg>
            ),
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
          },
          {
            title: "Join & Play",
            description: "Reserve your spot in seconds and hit the court.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3c0 0 2 3 2 9s-2 9-2 9" />
                <path d="M12 3c0 0-2 3-2 9s2 9 2 9" />
                <path d="M3.5 8.5h17M3.5 15.5h17" />
              </svg>
            ),
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
          },
          {
            title: "Meet Players",
            description: "Connect with the local volleyball community in Bamberg.",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
                <circle cx="9" cy="7" r="3" />
                <circle cx="15" cy="7" r="3" />
                <path strokeLinecap="round" d="M3 19c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6" />
              </svg>
            ),
            color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
