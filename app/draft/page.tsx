"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

type PlayerOption = {
  id: number;
  name: string;
  team: string;
  position: string;
};

type PickedPlayer = {
  id: number;
  name: string;
};

function PlayerSearch({
  label,
  positionFilter,
  value,
  onSelect,
  disabled,
}: {
  label: string;
  positionFilter?: string[];
  value: PickedPlayer | null;
  onSelect: (p: PickedPlayer) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/nhl-search?q=${encodeURIComponent(query)}`);
        const data: PlayerOption[] = await res.json();
        const filtered = positionFilter ? data.filter((p) => positionFilter.includes(p.position)) : data;
        setResults(filtered);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query, positionFilter]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (value) {
    return (
      <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
        <span className="text-white font-medium">{value.name}</span>
        {!disabled && (
          <button type="button" onClick={() => onSelect({ id: 0, name: "" })} className="text-slate-500 hover:text-red-400 text-sm ml-2">✕</button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={`Search ${label}...`}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none text-sm disabled:opacity-50"
      />
      {loading && <span className="absolute right-3 top-2.5 text-slate-500 text-sm">⏳</span>}
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {results.map((p) => (
            <button key={p.id} type="button"
              onMouseDown={() => { onSelect({ id: p.id, name: p.name }); setQuery(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center justify-between"
            >
              <span className="text-white text-sm">{p.name}</span>
              <span className="text-slate-400 text-xs">{p.position} · {p.team}</span>
            </button>
          ))}
        </div>
      )}
      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-400 text-sm">No players found</div>
      )}
    </div>
  );
}

const FORWARD_POSITIONS = ["C", "L", "R", "LW", "RW"];
const DEFENSE_POSITIONS = ["D"];
const GOALIE_POSITIONS = ["G"];

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " PT";
}

export default function DraftPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [alreadyEntered, setAlreadyEntered] = useState(false);
  const [existingTeamName, setExistingTeamName] = useState("");
  const [draftOpen, setDraftOpen] = useState(true);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [forwards, setForwards] = useState<(PickedPlayer | null)[]>(Array(6).fill(null));
  const [defensemen, setDefensemen] = useState<(PickedPlayer | null)[]>(Array(4).fill(null));
  const [goalies, setGoalies] = useState<(PickedPlayer | null)[]>(Array(2).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load auth state and pool config
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    fetch("/api/pool-config").then(r => r.json()).then(d => {
      setDraftOpen(d.draft_open);
      setDeadline(d.draft_deadline ?? null);
      // Also check deadline client-side
      if (d.draft_deadline && new Date(d.draft_deadline) < new Date()) {
        setDraftOpen(false);
      }
    });
  }, []);

  // Once we have a user, check if they already entered this season
  useEffect(() => {
    if (!user) return;
    fetch(`/api/my-entry?userId=${user.id}`).then(r => r.json()).then(d => {
      if (d.manager) {
        setAlreadyEntered(true);
        setExistingTeamName(d.manager.team_name);
      }
    });
  }, [user]);

  const allPicked = forwards.every(Boolean) && defensemen.every(Boolean) && goalies.every(Boolean);

  function setSlot<T>(arr: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, val: T) {
    const next = [...arr];
    if ((val as unknown as PickedPlayer)?.id === 0) {
      next[i] = null as unknown as T;
    } else {
      const allPicked = [...forwards, ...defensemen, ...goalies].filter(Boolean) as PickedPlayer[];
      if (allPicked.find((p) => p.id === (val as unknown as PickedPlayer).id)) {
        setError(`${(val as unknown as PickedPlayer).name} is already on your team`);
        return;
      }
      next[i] = val;
    }
    setter(next);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    if (!name.trim() || !teamName.trim()) { setError("Enter your name and team name"); return; }
    if (!allPicked) { setError("Pick all 12 players before submitting"); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          teamName: teamName.trim(),
          forwards: forwards.filter(Boolean),
          defensemen: defensemen.filter(Boolean),
          goalies: goalies.filter(Boolean),
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading auth
  if (user === undefined) {
    return <main className="max-w-lg mx-auto px-4 py-24 text-center"><p className="text-slate-500">Loading...</p></main>;
  }

  // Not logged in
  if (!user) {
    return (
      <main className="max-w-sm mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🏒</p>
        <h1 className="text-2xl font-bold text-white mb-2">Sign in to submit picks</h1>
        <p className="text-slate-400 text-sm mb-6">
          Use your email — same email next year means your history carries over.
        </p>
        {deadline && <p className="text-amber-400 text-sm mb-6">Draft closes: {formatDeadline(deadline)}</p>}
        <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
          Sign In →
        </Link>
        <div className="mt-6">
          <Link href="/" className="text-slate-600 hover:text-slate-400 text-sm">← View leaderboard</Link>
        </div>
      </main>
    );
  }

  // Already entered this season
  if (alreadyEntered) {
    return (
      <main className="max-w-sm mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;re already in!</h1>
        <p className="text-slate-400 text-sm mb-2">
          Your team <span className="text-white font-medium">&ldquo;{existingTeamName}&rdquo;</span> is locked in.
        </p>
        <p className="text-slate-500 text-xs mb-6">Contact Curtis to make changes.</p>
        <Link href="/" className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
          View Leaderboard →
        </Link>
      </main>
    );
  }

  // Draft closed
  if (!draftOpen) {
    return (
      <main className="max-w-sm mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-white mb-2">Draft is closed</h1>
        <p className="text-slate-400 text-sm mb-6">Picks are locked. Check the leaderboard once playoffs start.</p>
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm">← Leaderboard</Link>
      </main>
    );
  }

  if (success) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-white mb-2">You&apos;re in!</h2>
        <p className="text-slate-400">Heading to the leaderboard...</p>
      </main>
    );
  }

  const forwardCount = forwards.filter(Boolean).length;
  const dCount = defensemen.filter(Boolean).length;
  const gCount = goalies.filter(Boolean).length;

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">🏒 Submit Your Picks</h1>
        <p className="text-slate-400 text-sm mt-1">6 Forwards · 4 Defensemen · 2 Goalies</p>
        {deadline && (
          <p className="text-amber-400 text-xs mt-2">Draft closes: {formatDeadline(deadline)}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <p className="text-slate-500 text-xs">Signed in as {user.email}</p>
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Curtis"
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Team Name</label>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Teemu's Big Meat"
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Forwards</h2>
            <span className="text-slate-500 text-sm">{forwardCount}/6</span>
          </div>
          <div className="space-y-2">
            {forwards.map((p, i) => (
              <PlayerSearch key={i} label={`Forward ${i + 1}`} positionFilter={FORWARD_POSITIONS}
                value={p} onSelect={(v) => setSlot(forwards, setForwards, i, v)} />
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Defensemen</h2>
            <span className="text-slate-500 text-sm">{dCount}/4</span>
          </div>
          <div className="space-y-2">
            {defensemen.map((p, i) => (
              <PlayerSearch key={i} label={`Defenseman ${i + 1}`} positionFilter={DEFENSE_POSITIONS}
                value={p} onSelect={(v) => setSlot(defensemen, setDefensemen, i, v)} />
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Goalies</h2>
            <span className="text-slate-500 text-sm">{gCount}/2</span>
          </div>
          <div className="space-y-2">
            {goalies.map((p, i) => (
              <PlayerSearch key={i} label={`Goalie ${i + 1}`} positionFilter={GOALIE_POSITIONS}
                value={p} onSelect={(v) => setSlot(goalies, setGoalies, i, v)} />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">{error}</div>
        )}

        <button type="submit"
          disabled={submitting || !allPicked || !name.trim() || !teamName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition-colors text-lg"
        >
          {submitting ? "Submitting..." : "Lock In My Team 🔒"}
        </button>

        <p className="text-center text-slate-600 text-xs">
          Picks are final once submitted. Contact Curtis to make changes.
        </p>
      </form>
    </main>
  );
}
