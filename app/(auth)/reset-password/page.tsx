"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect to forgot-password if no token in URL
  useEffect(() => {
    if (!token) {
      router.replace("/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
      {success ? (
        <div className="text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h2 className="text-lg font-semibold text-zinc-100">Password updated!</h2>
          <p className="text-zinc-400 text-sm">
            Your password has been changed successfully. Redirecting you to the
            login page…
          </p>
          <Link
            href="/login"
            className="inline-block mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
          >
            Sign in now →
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
            <label htmlFor="new-password" className="text-sm font-medium text-zinc-300">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="text-sm font-medium text-zinc-300">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className={`rounded-lg bg-zinc-800 border px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-zinc-500 transition ${
                confirm && confirm !== password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-700 focus:ring-blue-500"
              }`}
            />
            {confirm && confirm !== password && (
              <p className="text-red-400 text-xs mt-0.5">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-3 font-semibold text-white transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating…
              </>
            ) : (
              "Set New Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <section className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-blue-500 text-3xl">◆</span>
            <span className="text-2xl font-bold text-zinc-100">QuantAI</span>
          </Link>
          <h1 className="text-3xl font-bold text-zinc-100">Set new password</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Choose a strong password for your account
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl flex items-center justify-center min-h-[200px]">
              <span className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-zinc-400">
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
            ← Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
