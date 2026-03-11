"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signInWithGoogle, signInAsGuest } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { trackEvent } from "@/lib/analytics";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      trackEvent("sign_in_success", { method: "email" });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      trackEvent("sign_in_success", { method: "google" });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setError("");
    setGuestLoading(true);
    try {
      await signInAsGuest();
      trackEvent("sign_in_success", { method: "guest" });
      router.push("/matches");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Guest sign in failed");
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="my-4 flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          or
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={handleGoogle}
          disabled={loading}
        >
          Continue with Google
        </Button>

        <div className="my-4 flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          veya
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={handleGuest}
          loading={guestLoading}
          disabled={loading || guestLoading}
        >
          Misafir olarak devam et
        </Button>

        <div className="mt-4 text-sm text-center space-y-2 text-gray-600 dark:text-gray-400">
          <div>
            <Link
              href="/reset-password"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div>
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
