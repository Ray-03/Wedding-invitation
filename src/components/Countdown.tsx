/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WEDDING_CONFIG } from '../config';
import Section from './ui/Section';
import SectionHeader from './ui/SectionHeader';
import { useGuest } from '../context/GuestContext';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetDate: number): TimeLeft {
  const difference = targetDate - Date.now();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function useCountdown(targetDate: number): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const tick = () => setTimeLeft(calcTimeLeft(targetDate));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

/**
 * For "both": Holy Matrimony until that time passes, then Reception.
 * For physical / livestream: fixed target.
 */
function resolveCountdownTarget(inviteType: string) {
  const holyTs = WEDDING_CONFIG.holyMatrimonyTimestamp;
  const receptionTs = WEDDING_CONFIG.weddingTimestamp;
  const now = Date.now();

  if (inviteType === 'physical') {
    return {
      title: 'Holy Matrimony',
      displayTime: WEDDING_CONFIG.holyMatrimonyTime,
      targetDate: holyTs,
    };
  }

  if (inviteType === 'livestream') {
    return {
      title: 'The Celebration',
      displayTime: WEDDING_CONFIG.weddingTime,
      targetDate: receptionTs,
    };
  }

  if (inviteType === 'special') {
    return {
      title: 'Holy Matrimony',
      displayTime: WEDDING_CONFIG.holyMatrimonyTime,
      targetDate: holyTs,
    };
  }

  // both — switch after holy matrimony time
  if (now < holyTs) {
    return {
      title: 'Holy Matrimony',
      displayTime: WEDDING_CONFIG.holyMatrimonyTime,
      targetDate: holyTs,
    };
  }

  return {
    title: 'The Celebration',
    displayTime: WEDDING_CONFIG.weddingTime,
    targetDate: receptionTs,
  };
}

export default function Countdown() {
  const { guest } = useGuest();
  const [target, setTarget] = useState(() => resolveCountdownTarget(guest.inviteType));
  const timeLeft = useCountdown(target.targetDate);

  // Re-evaluate when holy matrimony passes (for "both")
  useEffect(() => {
    const sync = () => setTarget(resolveCountdownTarget(guest.inviteType));
    sync();
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, [guest.inviteType]);

  return (
    <Section id="countdown">
      <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-[#3A75C4]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full bg-[#03307B]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
        <SectionHeader
          label="Counting Down to the Big Day"
          title={target.title}
          className="mb-6"
        />

        <motion.div
          key={target.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8 text-center"
        >
          <span className="font-sans text-xs sm:text-sm tracking-[0.2em] font-semibold text-[#03307B] uppercase border-y border-[#3A75C4]/40 py-2.5 px-6 inline-block bg-white/90">
            {WEDDING_CONFIG.weddingDate} &bull; {target.displayTime} WIB
          </span>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl w-full">
          {[
            { label: 'Days', val: timeLeft.days, desc: 'Days' },
            { label: 'Hours', val: timeLeft.hours, desc: 'Hours' },
            { label: 'Minutes', val: timeLeft.minutes, desc: 'Minutes' },
            { label: 'Seconds', val: timeLeft.seconds, desc: 'Seconds' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center bg-white border border-[#03307B]/10 p-6 sm:p-8 relative group hover:border-[#3A75C4]/60 transition-colors duration-500 shadow-sm"
            >
              <div className="absolute top-0 left-0 w-2 h-px bg-[#3A75C4]/60" />
              <div className="absolute top-0 left-0 w-px h-2 bg-[#3A75C4]/60" />
              <div className="absolute bottom-0 right-0 w-2 h-px bg-[#3A75C4]/60" />
              <div className="absolute bottom-0 right-0 w-px h-2 bg-[#3A75C4]/60" />

              <span className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#03307B] font-semibold tabular-nums">
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#03307B]/80 mt-2 font-semibold">
                {item.label}
              </span>
              <span className="font-mono text-[8px] tracking-widest text-[#03307B]/40 uppercase mt-0.5">
                {item.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
