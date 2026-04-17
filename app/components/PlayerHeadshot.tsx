'use client';

import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  size?: 'sm' | 'lg';
};

export default function PlayerHeadshot({ src, alt, size = 'sm' }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const dim = size === 'lg' ? 'w-24 h-24' : 'w-14 h-14';

  return (
    <div className={`relative ${dim} shrink-0 overflow-hidden rounded-sm`}
      style={{ background: 'rgba(255,255,255,0.04)' }}>
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
}
