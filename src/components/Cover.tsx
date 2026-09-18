/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from './ui/aurora-background';
import WeddingLogo from './ui/WeddingLogo';
import { WEDDING_CONFIG, getCoupleDisplayNames } from '../config';
import { GENERAL_GUEST_GREETING } from '../types/guest';
import { useGuest } from '../context/GuestContext';

interface CoverProps {
  onOpen: () => void;
  isOpen: boolean;
  guestGreeting?: string;
}

const openTransition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function Cover({
  onOpen,
  isOpen,
  guestGreeting = GENERAL_GUEST_GREETING,
}: CoverProps) {
  const { guest } = useGuest();
  const { groomName, brideName } = getCoupleDisplayNames(guest.inviteType);
  const logoVariant = guest.inviteType === 'physical' ? 'wedding' : 'livestream';

  const scrollToQuotes = () => {
    document.getElementById('quotes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AuroraBackground
      variant="immersive"
      id="cover"
      pauseAnimation={isOpen}
      className="relative p-0 flex flex-col justify-center items-center overflow-hidden min-h-[100dvh] w-full"
    >
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="absolute inset-0 border-t border-l border-r border-[#03307B]/15 pointer-events-none z-20"
      />

      {/* Postcard: shrinks, tilts, and fades from transparent → white */}
      <motion.div
        initial={false}
        animate={
          isOpen
            ? {
                scale: 0.48,
                rotate: -2.5,
                y: -24,
                backgroundColor: 'rgba(255, 255, 255, 1)',
                borderColor: 'rgba(3, 48, 123, 0.16)',
                boxShadow: '0px 24px 60px -18px rgba(3, 48, 123, 0.22)',
              }
            : {
                scale: 1,
                rotate: 0,
                y: 0,
                backgroundColor: 'rgba(255, 255, 255, 0)',
                borderColor: 'rgba(0, 0, 0, 0)',
                boxShadow: '0px 0px 0px 0px rgba(3, 48, 123, 0)',
              }
        }
        onClick={isOpen ? scrollToQuotes : undefined}
        transition={openTransition}
        className={`w-full h-[100dvh] max-h-screen overflow-hidden max-w-4xl mx-auto flex flex-col relative border z-10 rounded-sm pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] px-4 xs:px-6 sm:px-8 md:px-10 ${isOpen ? 'cursor-pointer' : ''}`}
        style={{ transformOrigin: 'center center' }}
      >
        <div className="w-full pt-2 sm:pt-4 px-2 flex justify-end items-start z-10 font-mono shrink-0">
          <div className="text-[11px] tracking-[0.35em] uppercase text-[#03307B]/80 font-bold">
            {WEDDING_CONFIG.weddingDateNumeric}
          </div>
        </div>

        <div className="flex-1 w-full min-h-0 flex flex-col justify-center items-center relative z-10 px-2 py-4 sm:py-6">
          <div
            className="absolute top-[8%] opacity-15 text-[#3A75C4] pointer-events-none"
            aria-hidden
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M50 90 C 50 50, 40 30, 20 20 M50 70 C 50 40, 60 25, 80 15 M50 90 L50 10 M50 50 C 45 45, 30 35, 25 45 C 30 55, 45 50, 50 50 M50 35 C 55 30, 70 20, 75 30 C 70 40, 55 35, 50 35" />
            </svg>
          </div>

          <div className="flex flex-col items-center w-full max-w-sm sm:max-w-xl md:max-w-2xl">
            <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-[#03307B] font-bold mb-2 sm:mb-4 text-center">
              The Wedding Celebration
            </p>

            <WeddingLogo
              variant={logoVariant}
              className="mb-2 sm:mb-4 w-[120px] xs:w-[150px] sm:w-[200px] h-[120px] xs:h-[150px] sm:h-[200px] select-none"
            />

            <div className="text-center w-full mt-1 sm:mt-2">
              <div className="flex flex-col sm:flex-row items-center sm:justify-center sm:gap-x-4 sm:flex-wrap">
                <h2 className="font-serif text-xl xs:text-2xl sm:text-[1.65rem] font-light text-[#03307B] whitespace-nowrap">
                  {groomName}
                </h2>
                <span className="font-serif text-xl sm:text-2xl text-[#03307B] py-0.5 sm:py-0 select-none">
                  &amp;
                </span>
                <h2 className="font-serif text-xl xs:text-2xl sm:text-[1.65rem] font-light text-[#03307B] whitespace-nowrap">
                  {brideName}
                </h2>
              </div>
            </div>

            <motion.div
              initial={false}
              animate={{
                opacity: isOpen ? 0 : 1,
                y: isOpen ? 12 : 0,
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`w-full mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4 z-30 relative ${isOpen ? 'pointer-events-none' : ''}`}
            >
              <p className="font-sans text-sm tracking-[0.04em] text-[#03307B] font-medium text-center max-w-xs leading-relaxed">
                {guestGreeting}
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                className="relative z-30 min-h-11 min-w-[44px] bg-[#03307B] active:bg-[#02245C] hover:bg-[#02245C] text-white tracking-[0.18em] font-sans text-[13px] uppercase px-8 py-3.5 rounded-none shadow-md inline-flex items-center justify-center gap-2 cursor-pointer touch-manipulation select-none font-medium"
              >
                <span>Open Invitation</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 min-touch px-4 py-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer z-40 touch-manipulation"
            onClick={scrollToQuotes}
          >
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#03307B]/60 font-semibold">
              Scroll Down
            </span>
            <div className="text-[#3A75C4]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuroraBackground>
  );
}
