"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="max-w-sm mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">📬</p>
        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-slate-400 text-sm">
          We sent a login link to <span className="text-white">{email}</span>.
          Click it to sign in — no password needed.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-slate-500 hover:text-slate-300 text-sm"
        >
          Use a different email
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">🏒 Goin&apos; Deep</h1>
        <p className="text-slate-400 text-sm">Sign in to submit your picks</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Sending..." : "Send Login Link"}
        </button>

        <p className="text-center text-slate-600 text-xs">
          We&apos;ll email you a link — no password needed.
          Same email next year = your history carries over.
        </p>
      </form>

      <div className="text-center mt-8">
        <Link href="/" className="text-slate-600 hover:text-slate-400 text-sm">
          ← View leaderboard
        </Link>
      </div>
    </main>
  );
}
