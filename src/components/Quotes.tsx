/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { WEDDING_CONFIG } from '../config';

export default function Quotes() {
  return (
    <section
      id="quotes"
      className="h-[100dvh] min-h-[100dvh] w-full flex flex-col justify-center items-center px-6 relative overflow-hidden bg-white"
    >
      {/* Editorial Decorative Background Text */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 font-serif text-[18vw] leading-none text-[#03307B]/[0.025] uppercase select-none pointer-events-none whitespace-nowrap z-0 font-bold">
        INFINITE PROMISE • INFINITE PROMISE
      </div>

      {/* Editorial Decorative Overlays & subtle line arts */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-[#3A75C4]/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-64 h-64 rounded-full bg-[#03307B]/5 blur-[80px] pointer-events-none" />

      {/* Decorative vertical background tracking lines */}
      <div className="absolute top-10 left-10 font-mono text-[9px] tracking-[0.3em] uppercase text-[#03307B]/30 [writing-mode:vertical-lr] hidden sm:block h-32">
        THE INFINITE PROMISE
      </div>
      <div className="absolute bottom-10 right-10 font-mono text-[9px] tracking-[0.3em] uppercase text-[#03307B]/30 [writing-mode:vertical-lr] rotate-180 hidden sm:block h-32">
        MOMENTS OF ETERNITY . {WEDDING_CONFIG.weddingYear}
      </div>

      <div className="max-w-3xl mx-auto w-full relative z-10 flex flex-col items-center text-center space-y-2 -mt-16 sm:-mt-22">
        
        {/* Subtle organic elegant line arts */}
        <div className="text-[#3A75C4] opacity-40">
          <svg width="44" height="44" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M50 10 C 60 30, 75 45, 50 85 C 25 45, 40 30, 50 10 Z" />
            <path d="M50 25 C 55 35, 62 42, 50 70 C 38 42, 45 35, 50 25 Z" />
            <path d="M30 45 C 40 45, 50 35, 50 25" />
            <path d="M70 45 C 60 45, 50 35, 50 25" />
          </svg>
        </div>

        {/* Pure Elegant Serif Quote Block */}
        <div className="space-y-3">
          <span className="font-mono text-xs tracking-[0.4em] uppercase text-[#3A75C4] font-bold block">
            The Infinite Promise
          </span>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-3.5xl text-[#03307B] tracking-wide leading-relaxed font-semibold italic max-w-2xl mx-auto">
            {WEDDING_CONFIG.bibleQuote}
          </h2>

          <div className="w-16 h-[1px] bg-[#3A75C4]/40 mx-auto" />
          
          <p className="font-sans text-xs sm:text-sm tracking-[0.1em] text-[#03307B]/70 max-w-md mx-auto leading-relaxed">
            {WEDDING_CONFIG.bibleQuoteSource}
          </p>

        </div>

      </div>
    </section>
  );
}
