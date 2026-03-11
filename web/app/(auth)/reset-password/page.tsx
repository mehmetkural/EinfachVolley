"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/firebase/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";

export default function ResetPasswordPage() {
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
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {success ? (
          <div className="text-center space-y-3">
            <p className="text-green-600 dark:text-green-400 text-sm">
              Reset link sent! Check your email.
            </p>
            <Link href="/sign-in">
              <Button variant="secondary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
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
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
            <Link href="/sign-in">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}
