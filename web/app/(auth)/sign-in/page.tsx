"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signInWithGoogle, signInAsGuest } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackEvent } from "@/lib/analytics";

export default function SignInPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
      setError(err instanceof Error ? err.message : t.auth.errorSignIn);
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
      setError(err instanceof Error ? err.message : t.auth.errorSignIn);
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
      setError(err instanceof Error ? err.message : t.auth.errorSignIn);
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase">{t.auth.signIn}</h1>
          <p className="text-on-surface-variant text-sm mt-2 font-medium">Volleyball. Simplified.</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-8 border-l-4 border-primary shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label={t.auth.email}
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label={t.auth.password}
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-error flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              {t.auth.signIn}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
            <div className="flex-1 border-t border-outline-variant/30" />
            {t.auth.or}
            <div className="flex-1 border-t border-outline-variant/30" />
          </div>

          <Button variant="secondary" className="w-full" onClick={handleGoogle} disabled={loading}>
            {t.auth.continueWithGoogle}
          </Button>

          <div className="my-5 flex items-center gap-3 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
            <div className="flex-1 border-t border-outline-variant/30" />
            {t.auth.or}
            <div className="flex-1 border-t border-outline-variant/30" />
          </div>

          <Button variant="ghost" className="w-full" onClick={handleGuest} loading={guestLoading} disabled={loading || guestLoading}>
            {t.auth.continueAsGuest}
          </Button>

          <div className="mt-6 text-sm text-center space-y-3 text-on-surface-variant">
            <div>
              <Link href="/reset-password" className="text-primary dark:text-primary-fixed hover:underline font-bold">
                {t.auth.forgotPassword}
              </Link>
            </div>
            <div>
              {t.auth.noAccount}{" "}
              <Link href="/sign-up" className="text-primary dark:text-primary-fixed hover:underline font-bold">
                {t.auth.signUp}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
