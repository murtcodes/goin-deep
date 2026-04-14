import { supabase } from "@/lib/supabase";
import { calcPoints } from "@/lib/supabase";
import type { PlayerStats } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getTeam(id: string) {
  const [{ data: manager }, { data: picks }, { data: stats }] = await Promise.all([
    supabase.from("managers").select("*").eq("id", id).single(),
    supabase.from("picks").select("*").eq("manager_id", id),
    supabase.from("player_stats").select("*"),
  ]);

  if (!manager) return null;

  const statsMap = new Map<number, PlayerStats>();
  for (const s of stats || []) statsMap.set(s.player_id, s);

  const enriched = (picks || [])
    .sort((a, b) => {
      const order: Record<string, number> = { F: 0, D: 1, G: 2 };
      return (order[a.position_type] ?? 0) - (order[b.position_type] ?? 0) || a.slot - b.slot;
    })
    .map((p) => ({
      ...p,
      stats: statsMap.get(p.player_id) ?? null,
    }));

  const totalPoints = enriched.reduce((sum, p) => {
    if (!p.stats) return sum;
    return sum + calcPoints(p.stats, p.position_type as "F" | "D" | "G");
  }, 0);

  return { manager, picks: enriched, totalPoints };
}

function StatLine({ stats, posType }: { stats: PlayerStats | null; posType: string }) {
  if (!stats) return <span className="text-slate-600 text-xs">No playoff games yet</span>;

  if (posType === "G") {
    const pts = stats.wins * 2 + stats.shutouts * 5;
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-400">{stats.gp} GP</span>
        <span className="text-slate-300">{stats.wins}W · {stats.shutouts} SO</span>
        <span className="text-amber-400 font-semibold ml-auto">{pts} pts</span>
      </div>
    );
  }

  const pts = stats.goals * 2 + stats.assists;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-400">{stats.gp} GP</span>
      <span className="text-slate-300">{stats.goals}G · {stats.assists}A</span>
      <span className="text-amber-400 font-semibold ml-auto">{pts} pts</span>
    </div>
  );
}

const POS_LABEL: Record<string, string> = { F: "Forwards", D: "Defensemen", G: "Goalies" };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getTeam(id);
  if (!data) notFound();

  const { manager, picks, totalPoints } = data;

  const grouped: Record<string, typeof picks> = { F: [], D: [], G: [] };
  for (const p of picks) grouped[p.position_type]?.push(p);

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-6 inline-block">
        ← Leaderboard
      </Link>

      {/* Team header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">{manager.team_name}</h1>
        <p className="text-slate-400 text-sm mt-1">{manager.name}</p>
        <p className="text-4xl font-bold text-amber-400 mt-3">{totalPoints} pts</p>
      </div>

      {/* Roster by position */}
      {(["F", "D", "G"] as const).map((pos) => (
        <div key={pos} className="mb-4">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            {POS_LABEL[pos]}
          </h2>
          <div className="space-y-2">
            {grouped[pos].map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-white font-medium text-sm">{p.player_name}</span>
                  <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                    {p.position_type}
                  </span>
                </div>
                <StatLine stats={p.stats ?? null} posType={p.position_type} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
