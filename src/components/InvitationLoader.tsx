'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface InvitationLoaderProps {
  photos: string[];
}

/** Interval between photo swaps — matches the snappy chinta-style flipbook. */
const SWAP_MS = 280;

export default function InvitationLoader({ photos }: InvitationLoaderProps) {
  const [index, setIndex] = useState(0);
  const list = useMemo(
    () => (photos.length > 0 ? photos : ['/images/story/story1.webp']),
    [photos],
  );

  // Only warm the next couple frames — avoid decoding every asset up front.
  useEffect(() => {
    const toWarm = [list[0], list[1], list[2]].filter(Boolean) as string[];
    toWarm.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [list]);

  useEffect(() => {
    if (list.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, SWAP_MS);
    return () => window.clearInterval(id);
  }, [list]);

  const src = list[index % list.length];

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center overflow-hidden">
      <div className="relative w-[22vmin] min-w-22 max-w-28 aspect-square">
        <AnimatePresence mode="sync" initial={false}>
          <motion.img
            key={src}
            src={src}
            alt=""
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute inset-0 size-full object-cover rounded-2xl shadow-[0_8px_28px_rgba(3,48,123,0.12)]"
            draggable={false}
            decoding="async"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
