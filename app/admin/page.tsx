"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Manager = {
  id: string;
  name: string;
  team_name: string;
  created_at: string;
  user_id: string | null;
  season: number;
};
type Config = { draft_open: boolean; season: number; draft_deadline?: string | null };

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [error, setError] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [deadlineStatus, setDeadlineStatus] = useState("");
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
  const [linkStatus, setLinkStatus] = useState<Record<string, string>>({});

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
      // Pre-fill deadline input if one is set
      if (data.config?.draft_deadline) {
        // Convert UTC ISO to local datetime-local value
        const d = new Date(data.config.draft_deadline);
        const pad = (n: number) => String(n).padStart(2, "0");
        setDeadlineInput(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        );
      }
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

  async function setDeadline() {
    setDeadlineStatus("Saving...");
    const deadline = deadlineInput ? new Date(deadlineInput).toISOString() : null;
    const res = await fetch(`/api/admin?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_deadline", deadline }),
    });
    const data = await res.json();
    if (data.error) {
      setDeadlineStatus(`Error: ${data.error}`);
    } else {
      setConfig((c) => c ? { ...c, draft_deadline: deadline } : c);
      setDeadlineStatus(deadline ? "Deadline set!" : "Deadline cleared");
    }
    setTimeout(() => setDeadlineStatus(""), 3000);
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

  async function linkUser(managerId: string) {
    const email = linkInputs[managerId]?.trim();
    if (!email) return;
    setLinkStatus((s) => ({ ...s, [managerId]: "Linking..." }));
    const res = await fetch(`/api/admin?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "link_user", managerId, email }),
    });
    const data = await res.json();
    if (data.error) {
      setLinkStatus((s) => ({ ...s, [managerId]: `Error: ${data.error}` }));
    } else {
      setLinkStatus((s) => ({ ...s, [managerId]: "Linked!" }));
      setManagers((m) =>
        m.map((x) => x.id === managerId ? { ...x, user_id: data.userId } : x)
      );
      setLinkInputs((i) => ({ ...i, [managerId]: "" }));
    }
    setTimeout(() => setLinkStatus((s) => ({ ...s, [managerId]: "" })), 4000);
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

      {/* Deadline setter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
        <p className="text-white font-medium mb-1">Draft Deadline</p>
        <p className="text-slate-500 text-xs mb-3">
          {config?.draft_deadline
            ? `Current: ${new Date(config.draft_deadline).toLocaleString("en-CA", { timeZone: "America/Vancouver", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })} PT`
            : "No deadline set — draft stays open until manually closed"}
        </p>
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={deadlineInput}
            onChange={(e) => setDeadlineInput(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none text-sm"
          />
          <button
            onClick={setDeadline}
            className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
          >
            Set
          </button>
          <button
            onClick={async () => {
              setDeadlineInput("");
              setDeadlineStatus("Saving...");
              const res = await fetch(`/api/admin?key=${key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "set_deadline", deadline: null }),
              });
              const data = await res.json();
              if (!data.error) {
                setConfig((c) => c ? { ...c, draft_deadline: null } : c);
                setDeadlineStatus("Deadline cleared");
              }
              setTimeout(() => setDeadlineStatus(""), 3000);
            }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm"
          >
            Clear
          </button>
        </div>
        {deadlineStatus && <p className="text-blue-400 text-xs mt-2">{deadlineStatus}</p>}
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
      <div className="space-y-3">
        {managers.map((m) => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white text-sm font-medium">{m.team_name}</p>
                <p className="text-slate-500 text-xs">
                  {m.name} · Season {m.season} · {new Date(m.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs mt-0.5">
                  {m.user_id
                    ? <span className="text-green-500">✓ Linked to account</span>
                    : <span className="text-amber-500">⚠ No account linked</span>
                  }
                </p>
              </div>
              <button
                onClick={() => deleteManager(m.id, m.name)}
                className="text-slate-600 hover:text-red-400 text-sm px-2"
              >
                🗑
              </button>
            </div>
            {/* Link user input — only show for unlinked managers */}
            {!m.user_id && (
              <div className="flex gap-2 mt-2">
                <input
                  type="email"
                  value={linkInputs[m.id] ?? ""}
                  onChange={(e) => setLinkInputs((i) => ({ ...i, [m.id]: e.target.value }))}
                  placeholder="user@email.com to link"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white placeholder-slate-600 outline-none text-xs"
                />
                <button
                  onClick={() => linkUser(m.id)}
                  disabled={!linkInputs[m.id]?.trim()}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg"
                >
                  Link
                </button>
              </div>
            )}
            {linkStatus[m.id] && (
              <p className={`text-xs mt-1 ${linkStatus[m.id].startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                {linkStatus[m.id]}
              </p>
            )}
          </div>
        ))}
        {managers.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-6">No teams yet</p>
        )}
      </div>
    </main>
  );
}
