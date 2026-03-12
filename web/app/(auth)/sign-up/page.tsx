"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackEvent } from "@/lib/analytics";

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(t.auth.passwordsMismatch);
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      trackEvent("sign_up_success", { method: "email" });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.auth.errorSignUp);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">{t.auth.createAccount}</h1>
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
            placeholder={t.auth.passwordMinHint}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            id="confirmPassword"
            type="password"
            label={t.auth.confirmPassword}
            placeholder={t.auth.passwordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t.auth.createAccount}
          </Button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          {t.auth.hasAccount}{" "}
          <Link
            href="/sign-in"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.auth.signIn}
          </Link>
        </p>
      </Card>
    </div>
  );
}
