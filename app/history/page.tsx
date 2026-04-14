import { supabase } from "@/lib/supabase";
import { calcPoints } from "@/lib/supabase";
import type { PlayerStats } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

function seasonLabel(s: number) {
  return `${String(s).slice(0, 4)}–${String(s).slice(4)}`;
}

async function getHistory() {
  const [{ data: managers }, { data: picks }, { data: stats }, { data: config }] =
    await Promise.all([
      supabase.from("managers").select("*").order("season", { ascending: false }).order("created_at"),
      supabase.from("picks").select("*"),
      supabase.from("player_stats").select("*"),
      supabase.from("pool_config").select("season").eq("id", 1).single(),
    ]);

  const currentSeason = config?.season || 20252026;

  const statsMap = new Map<string, PlayerStats>();
  for (const s of stats || []) {
    statsMap.set(`${s.player_id}-${s.season}`, s);
  }

  type ManagerRow = NonNullable<typeof managers>[number]

  // Group managers by season, exclude current
  const bySeasonMap = new Map<number, ManagerRow[]>();
  for (const m of managers || []) {
    if (m.season === currentSeason) continue;
    if (!bySeasonMap.has(m.season)) bySeasonMap.set(m.season, []);
    bySeasonMap.get(m.season)!.push(m);
  }

  const seasons = [...bySeasonMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([season, seasonManagers]) => {
      const scored = seasonManagers.map((manager) => {
        const managerPicks = (picks || []).filter((p) => p.manager_id === manager.id);
        const totalPoints = managerPicks.reduce((sum, p) => {
          const s = statsMap.get(`${p.player_id}-${season}`);
          if (!s) return sum;
          return sum + calcPoints(s, p.position_type as "F" | "D" | "G");
        }, 0);
        return { manager, totalPoints };
      });
      scored.sort((a, b) => b.totalPoints - a.totalPoints);
      return { season, scored };
    });

  return seasons;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function HistoryPage() {
  const seasons = await getHistory();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm">
          ← Current Season
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">📖 Past Seasons</h1>
        <p className="text-slate-400 text-sm mt-1">Goin&apos; Deep Hall of Fame</p>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-5xl mb-4">📭</p>
          <p>No past seasons yet. Check back after this one wraps up.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {seasons.map(({ season, scored }) => (
            <div key={season}>
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                {seasonLabel(season)} Playoffs
              </h2>
              <div className="space-y-2">
                {scored.map(({ manager, totalPoints }, i) => (
                  <Link
                    key={manager.id}
                    href={`/team/${manager.id}`}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-blue-600 rounded-xl px-4 py-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-7 text-center">
                        {i < 3 ? MEDALS[i] : <span className="text-slate-600 font-bold text-base">{i + 1}</span>}
                      </span>
                      <div>
                        <p className="text-white font-medium text-sm">{manager.team_name}</p>
                        <p className="text-slate-500 text-xs">{manager.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-400">{totalPoints}</p>
                      <p className="text-slate-600 text-xs">pts</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
