"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/Card";
import { Loader } from "@/components/Loader";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader className="mt-20" />;
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Training Sessions", value: "0" },
          { label: "Total Sets", value: "0" },
          { label: "Win Rate", value: "—" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <ProfileUpdateForm user={user} />
      </Card>
    </div>
  );
}

// Server Action example via client component form
import { useState } from "react";
import { updateDocument } from "@/services/firestore";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { User } from "firebase/auth";

function ProfileUpdateForm({ user }: { user: User }) {
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDocument("users", user.uid, { displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-sm">
      <Input
        id="displayName"
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" loading={loading}>
          Save Changes
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Email: {user.email}</p>
    </form>
  );
}
