import { supabase } from "@/lib/supabase";
import { calcPoints } from "@/lib/supabase";
import type { Manager, Pick, PlayerStats } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = 'force-dynamic';

type ManagerScore = {
  manager: Manager;
  totalPoints: number;
  picks: (Pick & { stats?: PlayerStats })[];
};

async function getLeaderboard(): Promise<{
  scores: ManagerScore[];
  lastUpdated: string | null;
  draftOpen: boolean;
}> {
  const [{ data: managers }, { data: picks }, { data: stats }, { data: config }] =
    await Promise.all([
      supabase.from("managers").select("*").order("created_at"),
      supabase.from("picks").select("*"),
      supabase.from("player_stats").select("*"),
      supabase.from("pool_config").select("*").eq("id", 1).single(),
    ]);

  const statsMap = new Map<number, PlayerStats>();
  for (const s of stats || []) statsMap.set(s.player_id, s);

  const lastUpdated =
    stats && stats.length > 0
      ? stats.reduce((latest, s) =>
          s.last_updated > latest.last_updated ? s : latest
        ).last_updated
      : null;

  const scores: ManagerScore[] = (managers || []).map((manager) => {
    const managerPicks = (picks || [])
      .filter((p) => p.manager_id === manager.id)
      .sort((a, b) => {
        const order: Record<string, number> = { F: 0, D: 1, G: 2 };
        return (order[a.position_type] ?? 0) - (order[b.position_type] ?? 0) || a.slot - b.slot;
      });

    const enriched = managerPicks.map((p) => ({
      ...p,
      stats: statsMap.get(p.player_id),
    }));

    const totalPoints = enriched.reduce((sum, p) => {
      if (!p.stats) return sum;
      return sum + calcPoints(p.stats, p.position_type as "F" | "D" | "G");
    }, 0);

    return { manager, totalPoints, picks: enriched };
  });

  scores.sort((a, b) => b.totalPoints - a.totalPoints);

  return { scores, lastUpdated, draftOpen: config?.draft_open ?? true };
}

export default async function Home() {
  const { scores, lastUpdated, draftOpen } = await getLeaderboard();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-1">🏒 Goin&apos; Deep</h1>
        <p className="text-slate-400 text-sm">2026 NHL Playoff Pool</p>
      </div>

      {/* Draft CTA */}
      {draftOpen ? (
        <div className="bg-blue-900/40 border border-blue-700 rounded-xl p-4 mb-8 text-center">
          <p className="text-blue-200 font-medium mb-2">🚨 Draft is OPEN — pick your team!</p>
          <Link
            href="/draft"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Submit Your Picks →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 mb-8 text-center">
          <p className="text-slate-400 text-sm">Draft closed · {scores.length} teams entered</p>
        </div>
      )}

      {/* Leaderboard */}
      {scores.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-5xl mb-4">🏒</p>
          <p>No picks yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => (
            <Link
              key={s.manager.id}
              href={`/team/${s.manager.id}`}
              className="block bg-slate-900 border border-slate-800 hover:border-blue-600 rounded-xl p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                      <span className="text-slate-500 text-lg font-bold">{i + 1}</span>
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{s.manager.team_name}</p>
                    <p className="text-slate-500 text-sm">{s.manager.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-400">{s.totalPoints}</p>
                  <p className="text-slate-500 text-xs">pts</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-center text-slate-600 text-xs mt-6">
          Stats last synced: {new Date(lastUpdated).toLocaleString("en-CA", { timeZone: "America/Vancouver" })} PT
        </p>
      )}

      {/* Scoring legend */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Scoring</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-slate-400">Skater Goal</span><span className="text-white font-medium">2 pts</span>
          <span className="text-slate-400">Skater Assist</span><span className="text-white font-medium">1 pt</span>
          <span className="text-slate-400">Goalie Win</span><span className="text-white font-medium">2 pts</span>
          <span className="text-slate-400">Goalie Shutout</span><span className="text-white font-medium">5 pts</span>
        </div>
      </div>
    </main>
  );
}
