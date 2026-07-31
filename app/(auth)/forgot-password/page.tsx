"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-600/8 rounded-full blur-3xl" />
      </div>

      <section className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-blue-500 text-3xl">◆</span>
            <span className="text-2xl font-bold text-zinc-100">QuantAI</span>
          </Link>
          <h1 className="text-3xl font-bold text-zinc-100">Reset password</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <h2 className="text-lg font-semibold text-zinc-100">Check your inbox</h2>
              <p className="text-zinc-400 text-sm">
                If an account exists for{" "}
                <span className="text-zinc-200 font-medium">{email}</span>, you
                will receive a password reset link shortly.
              </p>
              <p className="text-zinc-500 text-xs">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => { setSubmitted(false); setError(""); }}
                  className="text-blue-400 hover:text-blue-300 transition underline"
                >
                  try again
                </button>
                .
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className="text-sm font-medium text-zinc-300">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-3 font-semibold text-white transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-zinc-400">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
