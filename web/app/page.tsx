import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Volleyball Training,{" "}
          <span className="text-blue-600 dark:text-blue-400">Simplified</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          EinfachVolley helps you track your progress, analyze your game, and become a
          better volleyball player.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/support">
            <Button variant="secondary" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Track Progress",
            description:
              "Monitor your training sessions and track improvement over time.",
            icon: "📊",
          },
          {
            title: "Analyze Game",
            description: "Deep dive into your stats and understand your game better.",
            icon: "🏐",
          },
          {
            title: "Team Play",
            description: "Coordinate with your team and share insights.",
            icon: "👥",
          },
        ].map((feature) => (
          <Card key={feature.title}>
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {feature.description}
            </p>
          </Card>
        ))}
      </section>
    </div>
  );
}
