import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Goin' Deep 2026 — NHL Playoff Pool",
  description: "The boys' NHL playoff pool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        {/* Rink background layer */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 -left-10 w-[120%] rotate-12 rink-line-blue" />
          <div className="absolute top-2/3 -left-10 w-[120%] -rotate-6 rink-line-red" />
          <div className="absolute inset-0 skate-scratch" />
        </div>

        {/* Top nav */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16"
          style={{ background: 'rgba(4,19,41,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(154,204,243,0.1)', boxShadow: '0 4px 30px rgba(0,0,0,0.2)' }}>
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: '#9ACCF3', fontVariationSettings: "'FILL' 1" }}>sports_hockey</span>
            <span className="text-2xl font-black italic tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#9ACCF3' }}>
              PLAYOFF POOL
            </span>
          </Link>
          <Link href="/draft" className="text-sm font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#9ACCF3', background: 'rgba(154,204,243,0.1)', border: '1px solid rgba(154,204,243,0.2)' }}>
            Draft →
          </Link>
        </header>

        {/* Page content */}
        <main className="relative z-10 flex-1">
          {children}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 w-full h-20 flex justify-around items-center px-4 pb-2 z-50"
          style={{ background: 'rgba(4,19,41,0.92)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,75,75,0.2)', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>
          <NavItem href="/" icon="leaderboard" label="Standings" />
          <NavItem href="/my-picks" icon="edit_calendar" label="My Team" />
          <NavItem href="/history" icon="history" label="History" />
        </nav>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-3 transition-transform active:scale-90"
      style={{ color: 'rgba(154,204,243,0.5)' }}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-bold text-[10px] uppercase tracking-widest mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
    </Link>
  );
}
