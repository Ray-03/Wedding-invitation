/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { WEDDING_CONFIG } from '../config';
import { Heart } from 'lucide-react';
const groomImg = '/images/groom_portrait.webp';
const brideImg = '/images/bride_portrait.webp';

export default function Profiles() {
  return (
    <div 
      id="profiles" 
      className="relative w-full bg-white py-20 sm:py-32 overflow-hidden"
    >
      {/* Decorative Overlays matching the elegant Navy & Royal Blue theme */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-[#3A75C4]/5 blur-[48px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full bg-[#03307B]/5 blur-[48px] md:blur-[120px] pointer-events-none" />

      {/* TOP FLOATING HEADER BRANDING */}
      <div className="relative z-20 mb-16 sm:mb-24 px-6 text-center w-full max-w-7xl mx-auto flex flex-col items-center">
        <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#03307B] font-bold mb-2 block opacity-85">
          The Happy Couple
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#03307B] font-semibold tracking-tight">
          The Couple
        </h2>
        <div className="h-[1px] w-12 bg-[#3A75C4]/40 mt-3" />
      </div>

      {/* TWO PROFILES LAYOUT */}
      <div className="relative max-w-5xl mx-auto px-6 z-10">
        
        {/* Heart linking element - centered relative to the columns in desktop */}
        <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 hidden md:block z-20 pointer-events-none">
          <div className="p-3 bg-white border border-[#03307B]/10 rounded-full shadow-md text-[#3A75C4]">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          
          {/* GROOM VIEW (Left Column) */}
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            {/* Elegant Portrait Photo Frame */}
            <div className="relative group w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(3,48,123,0.08)] border-4 border-white ring-1 ring-[#03307B]/10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(3,48,123,0.15)] hover:border-[#3A75C4]/20">
              <img 
                src={groomImg} 
                alt="The Groom Portrait"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.98] contrast-[1.01]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03307B]/10 via-transparent to-transparent" />
            </div>

            <div className="space-y-3 sm:space-y-4 max-w-sm">
              {/* Role Identifier */}
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#3A75C4] font-bold">
                The Groom
              </span>
              
              {/* Groom Name */}
              <h3 className="font-serif text-2xl sm:text-3xl md:text-3.5xl text-[#03307B] font-bold tracking-tight">
                {WEDDING_CONFIG.groomFullName}
              </h3>

              <div className="h-[1px] w-12 bg-[#3A75C4]/30 mx-auto" />

              {(WEDDING_CONFIG.groomFatherName || WEDDING_CONFIG.groomMotherName) && (
                <p className="font-sans text-xs sm:text-sm text-[#03307B]/80 leading-relaxed">
                  {WEDDING_CONFIG.groomFatherName && WEDDING_CONFIG.groomMotherName ? (
                    <>
                      Only son of Mr. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.groomFatherName}</strong> & Mrs. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.groomMotherName}</strong>
                    </>
                  ) : WEDDING_CONFIG.groomFatherName ? (
                    <>
                      Only son of Mr. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.groomFatherName}</strong>
                    </>
                  ) : (
                    <>
                      Only son of Mrs. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.groomMotherName}</strong>
                    </>
                  )}
                </p>
              )}

              {/* Personal Groom Quote */}
              {WEDDING_CONFIG.groomQuote && (
                <p className="font-serif text-xs text-[#03307B]/75 italic leading-relaxed pt-2">
                  "{WEDDING_CONFIG.groomQuote}"
                </p>
              )}
            </div>
          </div>

          {/* BRIDE VIEW (Right Column) */}
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            {/* Elegant Portrait Photo Frame */}
            <div className="relative group w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(3,48,123,0.08)] border-4 border-white ring-1 ring-[#03307B]/10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(3,48,123,0.15)] hover:border-[#3A75C4]/20">
              <img 
                src={brideImg} 
                alt="The Bride Portrait"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.98] contrast-[1.01]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03307B]/10 via-transparent to-transparent" />
            </div>

            <div className="space-y-3 sm:space-y-4 max-w-sm">
              {/* Role Identifier */}
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#3A75C4] font-bold">
                The Bride
              </span>
              
              {/* Bride Name */}
              <h3 className="font-serif text-2xl sm:text-3xl md:text-3.5xl text-[#03307B] font-bold tracking-tight">
                {WEDDING_CONFIG.brideFullName}
              </h3>

              <div className="h-[1px] w-12 bg-[#3A75C4]/30 mx-auto" />

              {(WEDDING_CONFIG.brideFatherName || WEDDING_CONFIG.brideMotherName) && (
                <p className="font-sans text-xs sm:text-sm text-[#03307B]/80 leading-relaxed">
                  {WEDDING_CONFIG.brideFatherName && WEDDING_CONFIG.brideMotherName ? (
                    <>
                      Eldest daughter of Mr. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.brideFatherName}</strong> & Mrs. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.brideMotherName}</strong>
                    </>
                  ) : WEDDING_CONFIG.brideFatherName ? (
                    <>
                      Eldest daughter of Mr. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.brideFatherName}</strong>
                    </>
                  ) : (
                    <>
                      Eldest daughter of Mrs. <strong className="text-[#03307B] font-semibold">{WEDDING_CONFIG.brideMotherName}</strong>
                    </>
                  )}
                </p>
              )}

              {/* Personal Bride Quote */}
              {WEDDING_CONFIG.brideQuote && (
                <p className="font-serif text-xs text-[#03307B]/75 italic leading-relaxed pt-2">
                  "{WEDDING_CONFIG.brideQuote}"
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
