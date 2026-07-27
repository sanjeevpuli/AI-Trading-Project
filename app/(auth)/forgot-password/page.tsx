"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real system this would call an API; for now we show a success state
    setSubmitted(true);
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
                If an account exists for <span className="text-zinc-200 font-medium">{email}</span>,
                you will receive a password reset link shortly.
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className="text-sm font-medium text-zinc-300">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-500 transition"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-3 font-semibold text-white transition-colors"
              >
                Send Reset Link
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
