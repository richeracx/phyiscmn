'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { soundController } from '@/lib/cosmos/audio';

export function MuteButton() {
  const [muted, setMuted] = useState(() => soundController.isMuted);
  useEffect(() => soundController.subscribe(setMuted), []);

  return (
    <button
      type="button"
      onClick={() => soundController.toggleMute()}
      className="fixed bottom-16 left-6 z-[60] grid h-10 w-10 place-items-center rounded-full border border-white/[0.12] bg-black/70 text-white/70 shadow-lg transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      aria-label={muted ? 'Müzik Aç' : 'Müzik Kapat'}
      title={muted ? 'Müzik Aç' : 'Müzik Kapat'}
    >
      {muted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
    </button>
  );
}
