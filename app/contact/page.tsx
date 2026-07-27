"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-blue-500 text-xl">◆</span>
            <span className="text-xl font-bold text-zinc-100">QuantAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/features" className="hover:text-zinc-100 transition">Features</Link>
            <Link href="/about" className="hover:text-zinc-100 transition">About</Link>
            <Link href="/contact" className="text-zinc-100 font-medium">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition px-3 py-1.5">Sign In</Link>
            <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 mb-4">Get in Touch</h1>
            <p className="text-zinc-400 text-lg">Have a question or feedback? We&apos;d love to hear from you.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            {submitted ? (
              <div className="text-center space-y-4 py-8">
                <div className="text-5xl">🎉</div>
                <h2 className="text-xl font-semibold text-zinc-100">Message sent!</h2>
                <p className="text-zinc-400">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-300">Your name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-300">Email address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-300">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-3 font-semibold text-white transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
