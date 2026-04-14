"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Manager = { id: string; name: string; team_name: string; created_at: string };
type Config = { draft_open: boolean; season: number };

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (k: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?key=${k}`);
      if (res.status === 401) { setError("Wrong key"); return; }
      const data = await res.json();
      setConfig(data.config);
      setManagers(data.managers || []);
      setAuthed(true);
      setError("");
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggleDraft() {
    const res = await fetch(`/api/admin?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_draft" }),
    });
    const data = await res.json();
    setConfig((c) => c ? { ...c, draft_open: data.draft_open } : c);
  }

  async function deleteManager(id: string, name: string) {
    if (!confirm(`Delete ${name}'s team? This cannot be undone.`)) return;
    await fetch(`/api/admin?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_manager", managerId: id }),
    });
    setManagers((m) => m.filter((x) => x.id !== id));
  }

  async function syncStats() {
    setSyncStatus("Syncing...");
    try {
      const res = await fetch(`/api/sync?key=${key}`, { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setSyncStatus(`Error: ${data.error}`);
      } else {
        setSyncStatus(`Done! Updated ${data.updated} players, zeroed ${data.zeroed}`);
      }
    } catch {
      setSyncStatus("Sync failed");
    }
    setTimeout(() => setSyncStatus(""), 5000);
  }

  if (!authed) {
    return (
      <main className="max-w-sm mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white mb-6">Admin</h1>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(key)}
          placeholder="Admin key"
          className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none mb-3"
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          onClick={() => load(key)}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg"
        >
          {loading ? "..." : "Enter"}
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm">← Site</Link>
      </div>

      {/* Draft toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Draft Status</p>
          <p className={`text-sm mt-0.5 ${config?.draft_open ? "text-green-400" : "text-red-400"}`}>
            {config?.draft_open ? "OPEN — accepting picks" : "CLOSED — picks locked"}
          </p>
        </div>
        <button
          onClick={toggleDraft}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${
            config?.draft_open
              ? "bg-red-700 hover:bg-red-600 text-white"
              : "bg-green-700 hover:bg-green-600 text-white"
          }`}
        >
          {config?.draft_open ? "Close Draft" : "Open Draft"}
        </button>
      </div>

      {/* Sync */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Sync NHL Stats</p>
          <p className="text-slate-500 text-sm">Pull live playoff stats from NHL API</p>
          {syncStatus && <p className="text-blue-400 text-sm mt-1">{syncStatus}</p>}
        </div>
        <button
          onClick={syncStats}
          className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          Sync Now
        </button>
      </div>

      {/* Teams */}
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
        {managers.length} Teams Entered
      </h2>
      <div className="space-y-2">
        {managers.map((m) => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{m.team_name}</p>
              <p className="text-slate-500 text-xs">{m.name} · {new Date(m.created_at).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => deleteManager(m.id, m.name)}
              className="text-slate-600 hover:text-red-400 text-sm px-2"
            >
              🗑
            </button>
          </div>
        ))}
        {managers.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-6">No teams yet</p>
        )}
      </div>
    </main>
  );
}
