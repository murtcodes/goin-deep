"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PlayerOption = { id: number; name: string; team: string; position: string };
type PickedPlayer = { id: number; name: string };

const HL = "'Space Grotesk', sans-serif";
const ICE = '#9accf3';
const GOLD = '#fabd00';
const RED = '#FF4B4B';

function PlayerSearch({ label, positionFilter, value, onSelect, disabled }: {
  label: string; positionFilter?: string[]; value: PickedPlayer | null;
  onSelect: (p: PickedPlayer) => void; disabled?: boolean;
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
      } finally { setLoading(false); }
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
      <div className="flex items-center justify-between px-4 py-3 etched-ice"
        style={{ border: '1px solid rgba(154,204,243,0.2)', borderRadius: '0.125rem' }}>
        <span className="font-bold uppercase tracking-tight text-sm" style={{ fontFamily: HL, color: '#ffffff' }}>
          {value.name}
        </span>
        {!disabled && (
          <button type="button" onClick={() => onSelect({ id: 0, name: "" })}
            className="ml-3 transition-colors text-sm" style={{ color: 'rgba(154,204,243,0.4)' }}>
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative etched-ice" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.125rem' }}>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={`Search ${label}...`} disabled={disabled}
          className="w-full px-4 py-3 bg-transparent outline-none text-sm disabled:opacity-40"
          style={{ color: '#c9e6ff', fontFamily: HL }} />
        {loading && (
          <span className="absolute right-3 top-3 text-xs" style={{ color: 'rgba(154,204,243,0.5)' }}>...</span>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full overflow-hidden max-h-48 overflow-y-auto"
          style={{ background: '#1c2a41', border: '1px solid rgba(154,204,243,0.15)', borderRadius: '0.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {results.map((p) => (
            <button key={p.id} type="button"
              onMouseDown={() => { onSelect({ id: p.id, name: p.name }); setQuery(""); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(154,204,243,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span className="font-bold uppercase tracking-tight text-sm" style={{ fontFamily: HL, color: '#ffffff' }}>{p.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(154,204,243,0.5)' }}>{p.position} · {p.team}</span>
            </button>
          ))}
        </div>
      )}
      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 top-full mt-1 w-full px-4 py-3 text-xs"
          style={{ background: '#1c2a41', border: '1px solid rgba(154,204,243,0.1)', borderRadius: '0.25rem', color: 'rgba(154,204,243,0.4)', fontFamily: HL }}>
          No players found
        </div>
      )}
    </div>
  );
}

const FORWARD_POSITIONS = ["C", "L", "R", "LW", "RW"];
const DEFENSE_POSITIONS = ["D"];
const GOALIE_POSITIONS = ["G"];

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Vancouver", weekday: "short", month: "short",
    day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  }) + " PT";
}

function SectionHeader({ label, count, total }: { label: string; count: number; total: number }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <span className="font-bold uppercase tracking-tight text-sm whitespace-nowrap" style={{ fontFamily: HL, color: ICE }}>
        {label}
      </span>
      <div className="flex-grow flex items-center gap-2">
        <div className="ice-crystal w-2 h-2 shrink-0" />
        <div className="frozen-divider flex-grow" />
        <div className="ice-crystal w-2 h-2 shrink-0" />
      </div>
      <span className="text-xs font-black" style={{ fontFamily: HL, color: `${ICE}60` }}>{count}/{total}</span>
    </div>
  );
}

export default function DraftPage() {
  const router = useRouter();
  const [draftOpen, setDraftOpen] = useState(true);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [forwards, setForwards] = useState<(PickedPlayer | null)[]>(Array(6).fill(null));
  const [defensemen, setDefensemen] = useState<(PickedPlayer | null)[]>(Array(4).fill(null));
  const [goalies, setGoalies] = useState<(PickedPlayer | null)[]>(Array(2).fill(null));
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/pool-config").then(r => r.json()).then(d => {
      setDraftOpen(d.draft_open);
      setDeadline(d.draft_deadline ?? null);
      if (d.draft_deadline && new Date(d.draft_deadline) < new Date()) setDraftOpen(false);
    });
  }, []);

  const allPicked = forwards.every(Boolean) && defensemen.every(Boolean) && goalies.every(Boolean);

  function setSlot<T>(arr: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, val: T) {
    const next = [...arr];
    if ((val as unknown as PickedPlayer)?.id === 0) {
      next[i] = null as unknown as T;
    } else {
      const already = [...forwards, ...defensemen, ...goalies].filter(Boolean) as PickedPlayer[];
      if (already.find((p) => p.id === (val as unknown as PickedPlayer).id)) {
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
    if (!name.trim() || !teamName.trim() || !email.trim()) { setError("Fill in your name, team name, and email"); return; }
    if (!allPicked) { setError("Pick all 12 players before submitting"); return; }
    if (!captainId) { setError("Choose a captain before submitting"); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), teamName: teamName.trim(), email: email.trim(),
          forwards: forwards.filter(Boolean), defensemen: defensemen.filter(Boolean),
          goalies: goalies.filter(Boolean), captainPlayerId: captainId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); }
      else {
        localStorage.setItem("gd_entry", JSON.stringify({ email: email.trim().toLowerCase(), managerId: data.managerId }));
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      }
    } catch { setError("Network error. Try again."); }
    finally { setSubmitting(false); }
  }

  if (!draftOpen) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ fontFamily: HL, color: '#c9e6ff' }}>Draft Closed</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(193,199,206,0.6)' }}>Picks are locked. Check the leaderboard once playoffs start.</p>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: HL, color: 'rgba(154,204,243,0.4)' }}>← Standings</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🎉</p>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2" style={{ fontFamily: HL, color: '#c9e6ff' }}>You&apos;re In!</h2>
        <p className="text-sm" style={{ color: 'rgba(193,199,206,0.5)' }}>Heading to the leaderboard...</p>
      </div>
    );
  }

  const allPlayers = [...forwards, ...defensemen, ...goalies].filter(Boolean) as PickedPlayer[];

  return (
    <div className="pt-24 pb-32 px-4 max-w-2xl mx-auto">
      {/* Goal crease background */}
      <div className="goal-crease-bg" />

      {/* Page header */}
      <div className="mb-10">
        <h2 className="text-5xl font-black uppercase tracking-tighter" style={{ fontFamily: HL, color: '#c9e6ff' }}>
          Draft Your Roster
        </h2>
        <p className="text-xs uppercase tracking-widest mt-1" style={{ fontFamily: HL, color: 'rgba(154,204,243,0.4)' }}>
          Goin&apos; Deep · Seasonal Entry
        </p>
        {deadline && (
          <p className="text-xs font-bold mt-2" style={{ color: GOLD }}>
            Draft closes: {formatDeadline(deadline)}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Identity */}
        <section>
          <SectionHeader label="Your Info" count={[name, teamName, email].filter(Boolean).length} total={3} />
          <div className="space-y-3">
            {[
              { label: 'Your Name', value: name, set: setName, placeholder: 'e.g. Curtis', type: 'text' },
              { label: 'Team Name', value: teamName, set: setTeamName, placeholder: "e.g. Teemu's Big Meat", type: 'text' },
              { label: 'Email', value: email, set: setEmail, placeholder: 'you@example.com', type: 'email' },
            ].map(({ label, value, set, placeholder, type }) => (
              <div key={label}>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: HL, color: 'rgba(154,204,243,0.5)' }}>{label}</label>
                <input type={type} value={value} onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-transparent outline-none text-sm etched-ice"
                  style={{ color: '#c9e6ff', fontFamily: HL, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.125rem' }} />
              </div>
            ))}
            <p className="text-[10px]" style={{ color: 'rgba(154,204,243,0.25)' }}>
              Same email next year = your history carries over
            </p>
          </div>
        </section>

        {/* Forwards */}
        <section>
          <SectionHeader label="Forwards" count={forwards.filter(Boolean).length} total={6} />
          <div className="space-y-2">
            {forwards.map((p, i) => (
              <PlayerSearch key={i} label={`Forward ${i + 1}`} positionFilter={FORWARD_POSITIONS}
                value={p} onSelect={(v) => setSlot(forwards, setForwards, i, v)} />
            ))}
          </div>
        </section>

        {/* Defensemen */}
        <section>
          <SectionHeader label="Defensemen" count={defensemen.filter(Boolean).length} total={4} />
          <div className="space-y-2">
            {defensemen.map((p, i) => (
              <PlayerSearch key={i} label={`Defenseman ${i + 1}`} positionFilter={DEFENSE_POSITIONS}
                value={p} onSelect={(v) => setSlot(defensemen, setDefensemen, i, v)} />
            ))}
          </div>
        </section>

        {/* Goalies */}
        <section>
          <SectionHeader label="Goalies" count={goalies.filter(Boolean).length} total={2} />
          <div className="space-y-2">
            {goalies.map((p, i) => (
              <PlayerSearch key={i} label={`Goalie ${i + 1}`} positionFilter={GOALIE_POSITIONS}
                value={p} onSelect={(v) => setSlot(goalies, setGoalies, i, v)} />
            ))}
          </div>
        </section>

        {/* Captain picker */}
        {allPicked && (
          <section>
            <div className="flex justify-center">
              <div className="w-full p-6 relative"
                style={{ background: 'rgba(250,189,0,0.06)', border: `2px solid ${GOLD}`, borderRadius: '0.25rem', boxShadow: '0 0 30px rgba(250,189,0,0.15)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center font-black text-xl italic"
                    style={{ fontFamily: HL, background: GOLD, color: '#3f2e00', borderRadius: '0.125rem' }}>C</div>
                  <div>
                    <p className="font-black uppercase tracking-tight text-base" style={{ fontFamily: HL, color: GOLD }}>Choose Your Captain</p>
                    <p className="text-[10px] uppercase tracking-widest" style={{ fontFamily: HL, color: 'rgba(250,189,0,0.5)' }}>2× Points Bonus · All Playoffs</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {allPlayers.map((p) => (
                    <button key={p.id} type="button" onClick={() => setCaptainId(p.id)}
                      className="w-full text-left px-4 py-2.5 flex items-center justify-between transition-all"
                      style={{
                        background: captainId === p.id ? 'rgba(250,189,0,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${captainId === p.id ? GOLD : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '0.125rem',
                      }}>
                      <span className="font-bold uppercase tracking-tight text-sm"
                        style={{ fontFamily: HL, color: captainId === p.id ? GOLD : '#c9e6ff' }}>
                        {p.name}
                      </span>
                      {captainId === p.id && (
                        <span className="text-[10px] font-black uppercase" style={{ fontFamily: HL, color: GOLD }}>C · 2×</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 text-sm" style={{ background: 'rgba(255,75,75,0.1)', border: `1px solid ${RED}40`, borderRadius: '0.125rem', color: '#ffb3ae' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button type="submit"
          disabled={submitting || !allPicked || !captainId || !name.trim() || !teamName.trim() || !email.trim()}
          className="w-full py-4 font-black uppercase text-lg tracking-wider transition-all active:scale-[0.99] disabled:opacity-30"
          style={{
            fontFamily: HL,
            background: ICE,
            color: '#00344e',
            borderRadius: '0.125rem',
            boxShadow: '0 0 30px rgba(154,204,243,0.3)',
          }}>
          {submitting ? "Locking In..." : "Lock In My Team 🔒"}
        </button>

        <p className="text-center text-[10px]" style={{ color: 'rgba(154,204,243,0.2)', fontFamily: HL }}>
          PICKS ARE FINAL ONCE SUBMITTED · CONTACT CURTIS TO MAKE CHANGES
        </p>
      </form>
    </div>
  );
}
