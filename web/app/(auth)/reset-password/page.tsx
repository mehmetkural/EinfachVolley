"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight text-on-surface italic uppercase">{t.auth.resetPassword}</h1>
          <p className="text-on-surface-variant text-sm mt-2 font-medium">{t.auth.resetPasswordDesc}</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-8 border-l-4 border-primary shadow-xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-tertiary-container/40 rounded-2xl flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px] text-on-tertiary-container">mark_email_read</span>
              </div>
              <p className="text-on-surface font-bold">{t.auth.resetLinkSent}</p>
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
              {error && (
                <p className="text-sm text-error flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </p>
              )}
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
        </div>
      </div>
    </div>
  );
}
