import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Volleyball Games in{" "}
          <span className="text-blue-600 dark:text-blue-400">Bamberg</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Find the closest volleyball game to you, join in, and have fun.
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
            title: "Find a Game",
            description: "Browse upcoming matches near you and see who's playing.",
            icon: "📍",
          },
          {
            title: "Join & Play",
            description: "Reserve your spot in seconds and hit the court.",
            icon: "🏐",
          },
          {
            title: "Meet Players",
            description: "Connect with the local volleyball community in Bamberg.",
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
