'use client';

import { Heart, Link2, RefreshCw } from 'lucide-react';
import { WEDDING_CONFIG } from '../config';

interface InviteGateProps {
  reason: 'error';
  onRetry?: () => void;
}

export default function InviteGate({ reason, onRetry }: InviteGateProps) {
  const title = 'Couldn’t Open Invitation';
  const body =
    'We couldn’t load your invitation (network issue). Please check your connection and try again.';

  return (
    <div className="min-h-screen bg-white text-[#03307B] flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute top-[15%] right-[-10%] w-72 h-72 rounded-full bg-[#3A75C4]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-72 h-72 rounded-full bg-[#03307B]/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#03307B]/45">
          {WEDDING_CONFIG.groomName} & {WEDDING_CONFIG.brideName}
        </p>

        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-[#03307B]/5 border border-[#03307B]/10 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-[#3A75C4]" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-wide">
            {title}
          </h1>
          <p className="font-sans text-sm text-[#03307B]/70 leading-relaxed">{body}</p>
        </div>

        {reason === 'error' && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-6 border border-[#3A75C4] text-[#3A75C4] hover:bg-[#3A75C4] hover:text-white transition-colors duration-300 font-mono text-[10px] tracking-[0.2em] uppercase font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        )}

        <div className="flex items-center justify-center gap-2 pt-2 text-[#03307B]/35">
          <Heart className="w-3 h-3 fill-current" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
            Wedding invitation
          </span>
        </div>
      </div>
    </div>
  );
}
