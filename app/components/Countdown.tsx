'use client';

import { useEffect, useState } from 'react';
import { DRAFT_DEADLINE } from '@/lib/config';

function getTimeLeft() {
  const diff = DRAFT_DEADLINE.getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return (
      <p className="text-xs font-black uppercase tracking-widest text-center"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF4B4B' }}>
        Draft closed — picks revealed
      </p>
    );
  }

  const { d, h, m, s } = timeLeft;

  const Unit = ({ val, label }: { val: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="font-black tabular-nums leading-none"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', color: '#fabd00' }}>
        {String(val).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-black uppercase tracking-widest mt-0.5"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(250,189,0,0.5)' }}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] font-black uppercase tracking-[0.3em]"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(154,204,243,0.6)' }}>
        Draft closes · Apr 19 · 7PM ET
      </p>
      <div className="flex items-end gap-3">
        <Unit val={d} label="Days" />
        <span className="font-black text-2xl pb-4" style={{ color: 'rgba(250,189,0,0.4)' }}>:</span>
        <Unit val={h} label="Hrs" />
        <span className="font-black text-2xl pb-4" style={{ color: 'rgba(250,189,0,0.4)' }}>:</span>
        <Unit val={m} label="Min" />
        <span className="font-black text-2xl pb-4" style={{ color: 'rgba(250,189,0,0.4)' }}>:</span>
        <Unit val={s} label="Sec" />
      </div>
    </div>
  );
}
