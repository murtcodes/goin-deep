import { supabase } from "@/lib/supabase";
import { calcPoints } from "@/lib/supabase";
import type { PlayerStats } from "@/lib/supabase";
import Link from "next/link";
import PlayerHeadshot from "@/app/components/PlayerHeadshot";
import { notFound } from "next/navigation";
import { DRAFT_DEADLINE } from "@/lib/config";
import { ELIMINATED_TEAMS } from "@/lib/nhl";

export const dynamic = 'force-dynamic';

async function getPlayerMeta(playerId: number): Promise<{ team: string; headshot: string }> {
  try {
    const res = await fetch(`https://api-web.nhle.com/v1/player/${playerId}/landing`, { next: { revalidate: 3600 } });
    if (!res.ok) return { team: '', headshot: '' };
    const data = await res.json();
    const headshot = typeof data.headshot === 'string' ? data.headshot : '';
    // NHL returns a default-skater URL when no real photo exists
    const isDefault = /default-skater/i.test(headshot);
    return {
      team: data.currentTeamAbbrev || '',
      headshot: isDefault ? '' : headshot,
    };
  } catch { return { team: '', headshot: '' }; }
}

async function getTeam(id: string) {
  const [{ data: manager }, { data: picks }, { data: config }] = await Promise.all([
    supabase.from("managers").select("*").eq("id", id).single(),
    supabase.from("picks").select("*").eq("manager_id", id),
    supabase.from("pool_config").select("season").eq("id", 1).single(),
  ]);

  if (!manager) return null;

  const { data: stats } = await supabase
    .from("player_stats")
    .select("*")
    .eq("season", manager.season);

  const statsMap = new Map<number, PlayerStats>();
  for (const s of stats || []) statsMap.set(s.player_id, s);

  const enriched = (picks || [])
    .sort((a, b) => {
      const order: Record<string, number> = { F: 0, D: 1, G: 2 };
      return (order[a.position_type] ?? 0) - (order[b.position_type] ?? 0) || a.slot - b.slot;
    })
    .map((p) => ({ ...p, stats: statsMap.get(p.player_id) ?? null }));

  const totalPoints = enriched.reduce((sum, p) => {
    if (!p.stats) return sum;
    const pts = calcPoints(p.stats, p.position_type as "F" | "D" | "G");
    const multiplier = p.player_id === manager.captain_player_id ? 2 : 1;
    return sum + pts * multiplier;
  }, 0);

  // One NHL API call per player — gives us both team (for fallback) and canonical headshot URL
  const enrichedWithTeam = await Promise.all(enriched.map(async (p) => {
    const meta = await getPlayerMeta(p.player_id);
    const team = p.stats?.team ?? p.team ?? meta.team;
    return { ...p, team, headshot: meta.headshot };
  }));

  const currentSeason = config?.season ?? 20252026;
  return { manager, picks: enrichedWithTeam, totalPoints, currentSeason };
}

function StatLine({ stats, posType, isCaptain }: { stats: PlayerStats | null; posType: string; isCaptain?: boolean }) {
  const mult = isCaptain ? 2 : 1;
  if (!stats) {
    return (
      <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(154,204,243,0.3)', fontFamily: "'Space Grotesk', sans-serif" }}>
        No playoff games yet
      </p>
    );
  }
  if (posType === 'G') {
    const pts = (stats.wins * 2 + stats.shutouts * 5) * mult;
    return (
      <div className="flex items-center gap-4 text-sm mt-3">
        <div className="text-center">
          <span className="block text-[8px] uppercase tracking-widest" style={{ color: 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>GP</span>
          <span className="font-bold text-lg" style={{ color: '#c9e6ff', fontFamily: "'Space Grotesk', sans-serif" }}>{stats.gp}</span>
        </div>
        <div className="text-center">
          <span className="block text-[8px] uppercase tracking-widest" style={{ color: 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>W</span>
          <span className="font-bold text-lg" style={{ color: '#c9e6ff', fontFamily: "'Space Grotesk', sans-serif" }}>{stats.wins}</span>
        </div>
        <div className="text-center">
          <span className="block text-[8px] uppercase tracking-widest" style={{ color: 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>SO</span>
          <span className="font-bold text-lg" style={{ color: '#c9e6ff', fontFamily: "'Space Grotesk', sans-serif" }}>{stats.shutouts}</span>
        </div>
        <div className="text-center ml-auto">
          <span className="block text-[8px] uppercase tracking-widest" style={{ color: isCaptain ? 'rgba(250,189,0,0.6)' : 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>Pts</span>
          <span className="font-black text-2xl italic" style={{ color: isCaptain ? '#fabd00' : '#9accf3', fontFamily: "'Space Grotesk', sans-serif" }}>{pts}</span>
        </div>
      </div>
    );
  }
  const pts = (stats.goals * 2 + stats.assists) * mult;
  return (
    <div className="flex items-center gap-4 text-sm mt-3">
      <div className="text-center">
        <span className="block text-[8px] uppercase tracking-widest" style={{ color: 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>GP</span>
        <span className="font-bold text-lg" style={{ color: '#c9e6ff', fontFamily: "'Space Grotesk', sans-serif" }}>{stats.gp}</span>
      </div>
      <div className="text-center">
        <span className="block text-[8px] uppercase tracking-widest" style={{ color: 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>G</span>
        <span className="font-bold text-lg" style={{ color: '#c9e6ff', fontFamily: "'Space Grotesk', sans-serif" }}>{stats.goals}</span>
      </div>
      <div className="text-center">
        <span className="block text-[8px] uppercase tracking-widest" style={{ color: 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>A</span>
        <span className="font-bold text-lg" style={{ color: '#c9e6ff', fontFamily: "'Space Grotesk', sans-serif" }}>{stats.assists}</span>
      </div>
      <div className="text-center ml-auto">
        <span className="block text-[8px] uppercase tracking-widest" style={{ color: isCaptain ? 'rgba(250,189,0,0.6)' : 'rgba(193,199,206,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>Pts</span>
        <span className="font-black text-2xl italic" style={{ color: isCaptain ? '#fabd00' : '#9accf3', fontFamily: "'Space Grotesk', sans-serif" }}>{pts}</span>
      </div>
    </div>
  );
}

const POS_LABEL: Record<string, string> = { F: 'Forwards', D: 'Defensemen', G: 'Goalies' };

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ email?: string; key?: string }>;
}) {
  const { id } = await params;
  const { email, key } = await searchParams;
  const data = await getTeam(id);
  if (!data) notFound();

  const { manager, picks, totalPoints, currentSeason } = data;
  const pointsFor = (p: typeof picks[number]) => {
    if (!p.stats) return 0;
    const base = calcPoints(p.stats, p.position_type as "F" | "D" | "G");
    return base * (p.player_id === manager.captain_player_id ? 2 : 1);
  };
  const grouped: Record<string, typeof picks> = { F: [], D: [], G: [] };
  for (const p of picks) grouped[p.position_type]?.push(p);
  for (const pos of ['F', 'D', 'G'] as const) {
    grouped[pos].sort((a, b) => pointsFor(b) - pointsFor(a) || a.slot - b.slot);
  }

  const captain = picks.find(p => p.player_id === manager.captain_player_id);

  const isOwner = !!email && email.trim().toLowerCase() === manager.email?.toLowerCase();
  const isAdmin = key === process.env.ADMIN_SECRET_KEY;
  const isCurrentSeason = manager.season === currentSeason;
  const isLocked = isCurrentSeason && !isOwner && !isAdmin && Date.now() < DRAFT_DEADLINE.getTime();

  return (
    <div className="pt-24 pb-32 px-4 max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(154,204,243,0.4)' }}>
        <span className="material-symbols-outlined text-sm">arrow_back</span> Standings
      </Link>

      {/* Team hero */}
      <section className="mb-10 pl-6" style={{ borderLeft: '4px solid #FF4B4B' }}>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#d6e3ff' }}>
              {manager.team_name}
            </h2>
            <p className="font-bold tracking-[0.2em] uppercase mt-2 text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF4B4B' }}>
              {manager.name}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="p-4 flex flex-col items-center min-w-[100px]"
              style={{ background: '#1c2a41', borderTop: '2px solid rgba(154,204,243,0.2)' }}>
              <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(193,199,206,0.6)' }}>Points</span>
              <span className="text-3xl font-black italic" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#9accf3' }}>{totalPoints}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Locked state */}
      {isLocked ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center skate-scratch"
          style={{ background: 'rgba(154,204,243,0.04)', border: '1px solid rgba(154,204,243,0.12)', borderRadius: '0.25rem' }}>
          <div className="text-5xl mb-5">🔒</div>
          <h3 className="font-black uppercase tracking-tight text-xl mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c9e6ff' }}>
            Picks Locked
          </h3>
          <p className="text-sm font-bold uppercase tracking-widest"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(154,204,243,0.45)' }}>
            Rosters reveal Apr 18 · 12PM PT
          </p>
          <p className="mt-4 text-xs" style={{ color: 'rgba(154,204,243,0.3)' }}>
            No peeking. Everyone stays blind until the puck drops.
          </p>
        </div>
      ) : (
        <>
          {/* Captain spotlight */}
          {captain && (() => {
            const captainElim = ELIMINATED_TEAMS.has(captain.team ?? '');
            return (
              <section className="mb-8" style={{ opacity: captainElim ? 0.45 : 1 }}>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fabd00' }}>
                  <span className="h-px w-8 block" style={{ background: 'rgba(250,189,0,0.3)' }} />
                  Team Captain
                </h3>
                <div className="relative overflow-hidden skate-texture p-6"
                  style={{ background: '#27354c', border: `2px solid ${captainElim ? 'rgba(250,189,0,0.3)' : '#fabd00'}`, boxShadow: captainElim ? 'none' : '0 0 40px rgba(250,189,0,0.15)', borderRadius: '0.25rem' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="inline-flex items-center justify-center w-10 h-10 font-black text-2xl italic mb-3"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", background: captainElim ? 'rgba(250,189,0,0.3)' : '#fabd00', color: '#3f2e00', borderRadius: '0.125rem', boxShadow: captainElim ? 'none' : '0 0 15px rgba(250,189,0,0.5)' }}>
                        C
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-3xl font-black uppercase tracking-tighter leading-none"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", color: captainElim ? 'rgba(255,255,255,0.5)' : '#ffffff' }}>
                          {captain.player_name}
                        </h4>
                        {captainElim && (
                          <span className="inline-block self-start text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(255,75,75,0.2)', color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '0.125rem' }}>
                            Eliminated
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-1"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#9accf3' }}>
                        {captain.position_type} · 2× Points
                      </p>
                    </div>
                    {captain.headshot && (
                      <PlayerHeadshot
                        src={captain.headshot}
                        alt={captain.player_name}
                        size="lg"
                      />
                    )}
                  </div>
                  <StatLine stats={captain.stats ?? null} posType={captain.position_type} isCaptain />
                </div>
              </section>
            );
          })()}

          {/* Roster by position */}
          {(['F', 'D', 'G'] as const).map((pos) => (
            <div key={pos} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-bold uppercase tracking-tight text-sm"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c9e6ff' }}>
                  {POS_LABEL[pos]}
                </span>
                <div className="flex-grow flex items-center gap-2">
                  <div className="ice-crystal w-2 h-2" />
                  <div className="frozen-divider flex-grow" />
                  <div className="ice-crystal w-2 h-2" />
                </div>
              </div>
              <div className="space-y-2">
                {grouped[pos].map((p) => {
                  const isCaptain = p.player_id === manager.captain_player_id;
                  if (isCaptain) return null;
                  const isElim = ELIMINATED_TEAMS.has(p.team ?? '');
                  return (
                    <div key={p.id} className="relative p-4 skate-texture transition-colors"
                      style={{ background: '#0d1c32', borderTop: `2px solid ${isElim ? 'rgba(154,204,243,0.06)' : 'rgba(154,204,243,0.15)'}`, borderRadius: '0.125rem', opacity: isElim ? 0.45 : 1 }}>
                      <div className="flex items-start gap-3">
                        {p.headshot && (
                          <PlayerHeadshot
                            src={p.headshot}
                            alt={p.player_name}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold uppercase tracking-tight text-base"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", color: isElim ? 'rgba(255,255,255,0.5)' : '#ffffff' }}>
                                {p.player_name}
                              </span>
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.5"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(154,204,243,0.1)', color: 'rgba(154,204,243,0.6)', borderRadius: '0.125rem' }}>
                                {p.position_type}
                              </span>
                            </div>
                            {isElim && (
                              <span className="inline-block self-start text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(255,75,75,0.2)', color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '0.125rem' }}>
                                Eliminated
                              </span>
                            )}
                          </div>
                          <StatLine stats={p.stats ?? null} posType={p.position_type} isCaptain={false} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
