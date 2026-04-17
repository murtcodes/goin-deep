import { supabase } from "@/lib/supabase";
import { calcPoints } from "@/lib/supabase";
import type { Manager, Pick, PlayerStats } from "@/lib/supabase";
import Link from "next/link";
import Countdown from "@/app/components/Countdown";

export const dynamic = 'force-dynamic';


type ManagerScore = {
  manager: Manager;
  totalPoints: number;
  picks: (Pick & { stats?: PlayerStats })[];
};

async function getLeaderboard() {
  const { data: config } = await supabase.from("pool_config").select("*").eq("id", 1).single();
  const season = config?.season || 20252026;

  const [{ data: managers }, { data: picks }, { data: stats }] = await Promise.all([
    supabase.from("managers").select("*").eq("season", season).order("created_at"),
    supabase.from("picks").select("*"),
    supabase.from("player_stats").select("*").eq("season", season),
  ]);

  const statsMap = new Map<number, PlayerStats>();
  for (const s of stats || []) statsMap.set(s.player_id, s);

  const lastUpdated = stats && stats.length > 0
    ? stats.reduce((latest, s) => s.last_updated > latest.last_updated ? s : latest).last_updated
    : null;

  const scores: ManagerScore[] = (managers || []).map((manager) => {
    const managerPicks = (picks || [])
      .filter((p) => p.manager_id === manager.id)
      .sort((a, b) => {
        const order: Record<string, number> = { F: 0, D: 1, G: 2 };
        return (order[a.position_type] ?? 0) - (order[b.position_type] ?? 0) || a.slot - b.slot;
      });

    const enriched = managerPicks.map((p) => ({ ...p, stats: statsMap.get(p.player_id) }));

    const totalPoints = enriched.reduce((sum, p) => {
      if (!p.stats) return sum;
      const pts = calcPoints(p.stats, p.position_type as "F" | "D" | "G");
      const multiplier = p.player_id === manager.captain_player_id ? 2 : 1;
      return sum + pts * multiplier;
    }, 0);

    return { manager, totalPoints, picks: enriched };
  });

  scores.sort((a, b) => b.totalPoints - a.totalPoints);
  return { scores, lastUpdated, draftOpen: config?.draft_open ?? true, season };
}

const RANK_STYLES = [
  { bg: 'rgba(250,189,0,0.12)', border: 'rgba(250,189,0,0.35)', num: '#fabd00', pts: '#fabd00', glow: '0 0 30px rgba(250,189,0,0.2)' },
  { bg: 'rgba(154,204,243,0.08)', border: 'rgba(154,204,243,0.2)', num: '#9accf3', pts: '#9accf3', glow: 'none' },
  { bg: 'rgba(154,204,243,0.05)', border: 'rgba(154,204,243,0.1)', num: '#9accf3', pts: '#9accf3', glow: 'none' },
];

export default async function Home() {
  const { scores, lastUpdated, draftOpen, season } = await getLeaderboard();
  const seasonLabel = `${String(season).slice(0, 4)}–${String(season).slice(4)}`;

  return (
    <div className="pt-24 pb-32 px-4 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8 flex flex-col items-center">
        <span className="text-xs font-black uppercase tracking-[0.4em] mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fabd00' }}>
          {seasonLabel} Playoffs
        </span>
        <h2 className="text-5xl font-black italic tracking-tighter uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c9e6ff' }}>
          Goin&apos; Deep
        </h2>
        <div className="w-16 h-1 mt-2 opacity-50" style={{ background: '#FF4B4B' }} />
      </div>

      {/* Draft CTA */}
      {draftOpen && (
        <div className="mb-8 rounded-lg p-5 text-center"
          style={{ background: 'rgba(154,204,243,0.06)', border: '1px solid rgba(154,204,243,0.2)' }}>
          <p className="font-black uppercase tracking-wide mb-3 text-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c9e6ff' }}>
            🚨 Draft is OPEN
          </p>
          <Link href="/draft"
            className="inline-block font-black uppercase px-6 py-2.5 transition-all active:scale-95 mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#9accf3', color: '#00344e', borderRadius: '0.125rem', boxShadow: '0 0 20px rgba(154,204,243,0.3)' }}>
            Submit Your Picks →
          </Link>
          <div className="mt-1 pt-4" style={{ borderTop: '1px solid rgba(250,189,0,0.15)' }}>
            <Countdown />
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {scores.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'rgba(154,204,243,0.4)' }}>
          <p className="text-5xl mb-4">🏒</p>
          <p className="font-black uppercase tracking-widest text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No picks yet. Be the first.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => {
            const style = RANK_STYLES[i] ?? { bg: 'rgba(154,204,243,0.03)', border: 'rgba(255,255,255,0.05)', num: 'rgba(154,204,243,0.4)', pts: 'rgba(154,204,243,0.4)', glow: 'none' };
            return (
              <Link key={s.manager.id} href={`/team/${s.manager.id}`}
                className="block relative skate-scratch snow-buildup transition-all active:scale-[0.99]"
                style={{ background: style.bg, border: `1px solid ${style.border}`, boxShadow: style.glow, borderRadius: '0.25rem', backdropFilter: 'blur(12px)' }}>
                <div className="p-5 flex items-center gap-4">
                  {/* Rank number */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${style.border}`, borderRadius: '0.25rem' }}>
                    <span className="font-black text-2xl leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", color: style.num }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {i === 0 && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="material-symbols-outlined text-sm" style={{ color: '#fabd00', fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>star</span>
                      </div>
                    )}
                    <h3 className="font-extrabold text-xl uppercase tracking-tight truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#ffffff' }}>
                      {s.manager.team_name}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-widest truncate"
                      style={{ color: 'rgba(193,199,206,0.7)' }}>
                      {s.manager.name}
                    </p>
                  </div>
                  {/* Points */}
                  <div className="text-right shrink-0">
                    <div className="font-black text-3xl tabular-nums tracking-tighter"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: style.pts }}>
                      {s.totalPoints}
                    </div>
                    <div className="text-[10px] font-black uppercase" style={{ color: `${style.pts}80` }}>pts</div>
                  </div>
                </div>
                {/* Rink line divider for top 3 */}
                {i === 2 && (
                  <div className="absolute -bottom-4 left-0 w-full">
                    <div className="rink-line-blue w-full" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Scoring legend */}
      <div className="mt-12 p-6 skate-scratch"
        style={{ background: '#112036', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(154,204,243,0.6)' }}>
          Scoring System
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {[
            ['Skater Goal', '2 pts'],
            ['Skater Assist', '1 pt'],
            ['Goalie Win', '2 pts'],
            ['Goalie Shutout', '5 pts'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span style={{ color: 'rgba(214,227,255,0.6)' }}>{label}</span>
              <span className="font-bold" style={{ color: '#c9e6ff' }}>{val}</span>
            </div>
          ))}
          <div className="flex justify-between col-span-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#fabd00' }}>Captain (C)</span>
            <span className="font-bold" style={{ color: '#fabd00' }}>2× pts</span>
          </div>
        </div>
      </div>

      {/* Past seasons */}
      <div className="text-center mt-8">
        <Link href="/history" className="text-xs font-bold uppercase tracking-widest transition-colors"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(154,204,243,0.35)' }}>
          Past Seasons →
        </Link>
      </div>

      {lastUpdated && (
        <p className="text-center text-[10px] mt-4" style={{ color: 'rgba(154,204,243,0.25)' }}>
          Stats synced: {new Date(lastUpdated).toLocaleString("en-CA", { timeZone: "America/Vancouver" })} PT
        </p>
      )}
    </div>
  );
}
