"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.auth.errorReset);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">{t.auth.resetPassword}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t.auth.resetPasswordDesc}
        </p>

        {success ? (
          <div className="text-center space-y-3">
            <p className="text-green-600 dark:text-green-400 text-sm">
              {t.auth.resetLinkSent}
            </p>
            <Link href="/sign-in">
              <Button variant="secondary" className="w-full">
                {t.auth.backToSignIn}
              </Button>
            </Link>
          </div>
        ) : (
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
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              {t.auth.sendResetLink}
            </Button>
            <Link href="/sign-in">
              <Button variant="ghost" className="w-full">
                {t.auth.backToSignIn}
              </Button>
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}
