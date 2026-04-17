"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const HL = "'Space Grotesk', sans-serif";
const ICE = '#9accf3';

export default function MyPicksPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Try localStorage first
    try {
      const stored = localStorage.getItem("gd_entry");
      if (stored) {
        const { managerId, email: storedEmail } = JSON.parse(stored);
        if (managerId) {
          router.replace(`/team/${managerId}?email=${encodeURIComponent(storedEmail || '')}`);
          return;
        }
      }
    } catch {}
    setLoading(false);
  }, [router]);

  async function lookup() {
    if (!email.trim()) return;
    setLooking(true);
    setError("");
    try {
      const res = await fetch(`/api/my-entry?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.manager) {
        const normalized = email.trim().toLowerCase();
        localStorage.setItem("gd_entry", JSON.stringify({ email: normalized, managerId: data.manager.id }));
        router.push(`/team/${data.manager.id}?email=${encodeURIComponent(normalized)}`);
      } else {
        setError("No team found for that email this season.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLooking(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <p className="text-sm" style={{ color: 'rgba(154,204,243,0.4)', fontFamily: HL }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 px-4 max-w-sm mx-auto">
      <div className="mb-10">
        <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ fontFamily: HL, color: '#c9e6ff' }}>
          My Picks
        </h2>
        <p className="text-xs uppercase tracking-widest mt-1" style={{ fontFamily: HL, color: 'rgba(154,204,243,0.4)' }}>
          Enter your email to view your team
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
          style={{ fontFamily: HL, color: 'rgba(154,204,243,0.5)' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-transparent outline-none text-sm etched-ice"
          style={{ color: '#c9e6ff', fontFamily: HL, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.125rem' }}
        />

        {error && (
          <p className="text-sm px-3 py-2" style={{ color: '#ffb3ae', background: 'rgba(255,75,75,0.1)', borderRadius: '0.125rem' }}>
            {error}
          </p>
        )}

        <button
          onClick={lookup}
          disabled={looking || !email.trim()}
          className="w-full py-3 font-black uppercase tracking-wider text-sm transition-all disabled:opacity-30"
          style={{ fontFamily: HL, background: ICE, color: '#00344e', borderRadius: '0.125rem' }}
        >
          {looking ? "Looking..." : "View My Team →"}
        </button>

        <p className="text-[10px] text-center pt-2" style={{ color: 'rgba(154,204,243,0.2)', fontFamily: HL }}>
          Once found, we&apos;ll remember you on this device
        </p>
      </div>
    </div>
  );
}
