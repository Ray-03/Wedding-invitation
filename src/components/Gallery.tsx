/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { WEDDING_CONFIG } from '../config';
import Section from './ui/Section';
import SectionHeader from './ui/SectionHeader';
import type { GalleryImage } from '../lib/getGalleryImages';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  placeholderGradient: string;
}

// Custom high-performance Lazy Loading + Blur-Up placeholder component
function LazyImage({ src, alt, width, height, placeholderGradient }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="w-full relative overflow-hidden bg-[#03307B]/5 select-none"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* Real image — lazy-loaded; opacity-only fade (no CSS filter blur — janks Safari) */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
      />

      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 bg-slate-50 flex items-center justify-center"
          >
            <div className={`absolute inset-0 bg-gradient-to-tr ${placeholderGradient} animate-pulse`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GalleryItemProps {
  image: GalleryImage;
  idx: number;
  onClick: () => void;
}

function GalleryItem({ 
  image, 
  idx, 
  onClick 
 }: GalleryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (idx % 4) * 0.05, duration: 0.5 }}
      whileHover={{ 
        scale: 1.025, 
        y: -4, 
        zIndex: 30,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      onClick={onClick}
      className="w-full cursor-pointer relative break-inside-avoid mb-4 sm:mb-6 block"
    >
      <div className="w-full overflow-hidden bg-white border border-[#03307B]/10 relative shadow-[0_12px_24px_-15px_rgba(3,48,123,0.08)] hover:shadow-[0_24px_48px_-12px_rgba(3,48,123,0.15)] rounded-none hover:border-[#3A75C4]/40 transition-all duration-500 group">
        <LazyImage 
          src={image.src} 
          alt={image.alt} 
          width={image.width} 
          height={image.height} 
          placeholderGradient={image.placeholderGradient}
        />
        <div className="absolute inset-0 bg-[#03307B]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-white/90 text-[#03307B] p-2.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface GalleryProps {
  images: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const textBgX = useTransform(scrollYProgress, [0, 1], ["5%", "-15%"]);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  
  // Stable random/shuffled order initialized once on mount
  const [shuffledImages] = useState<GalleryImage[]>(() => {
    const list = [...images];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  });

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx + 1) % shuffledImages.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx - 1 + shuffledImages.length) % shuffledImages.length);
    }
  };

  return (
    <Section
      id="gallery"
      ref={ref}
    >
      {/* Editorial Decorative Details */}
      <div
        className="absolute top-20 left-4 font-mono text-[9px] tracking-[0.3em] uppercase text-[#03307B]/45 [writing-mode:vertical-lr] hidden sm:block select-none"
      >
        ENGAGEMENT PORTRAITS . {WEDDING_CONFIG.groomName.toUpperCase()} & {WEDDING_CONFIG.brideName.toUpperCase()}
      </div>

      <motion.div
        style={{ x: textBgX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 font-serif text-[15vw] leading-none text-[#03307B]/[0.03] uppercase select-none pointer-events-none whitespace-nowrap z-0 font-bold will-change-transform"
      >
        MOMENTS • MOMENTS • MOMENTS
      </motion.div>

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col items-center">
        
        <SectionHeader 
          label="Togetherness Moments"
          title="Our Pre-Wedding Gallery"
        />

        {/* Organic Native CSS Multi-Column Masonry Layout */}
        {shuffledImages.length > 0 ? (
          <div 
            className="w-full columns-2 sm:columns-3 md:columns-4 gap-4 sm:gap-6 pt-2 transition-all duration-500"
          >
            {shuffledImages.map((image, idx) => (
              <GalleryItem 
                key={image.id}
                image={image}
                idx={idx}
                onClick={() => setActiveIdx(idx)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-16 px-4 bg-white/40 border border-[#03307B]/10 rounded-sm">
            <p className="font-serif italic text-base text-[#03307B]/80 mb-2">No photos in the gallery yet.</p>
          </div>
        )}

        {/* Small Aesthetic Caption beneath the grid */}
        <p className="flex w-full justify-center font-serif italic text-xs text-center text-[#03307B]/70 leading-relaxed mt-12">
          "{WEDDING_CONFIG.storyQuote}"
        </p>
      </div>

      {/* Modern overlap details */}
      <div className="absolute right-0 bottom-0 w-36 h-36 bg-[#EAD8B1]/20 rounded-tl-full -z-10" />

      {/* Lightbox Modal with Framer Motion Smooth Transitions */}
      <AnimatePresence>
        {activeIdx !== null && shuffledImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1A1412]/98 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setActiveIdx(null)}
          >
            <button
              onClick={() => setActiveIdx(null)}
              className="absolute top-6 right-6 min-touch p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 z-50 group inline-flex items-center justify-center"
              title="Close Gallery"
            >
              <X className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>

            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
              
              <button
                onClick={handlePrev}
                className="absolute left-0 sm:-left-20 min-touch p-4 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 z-20 group inline-flex items-center justify-center"
                title="Previous Photo"
              >
                <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 sm:-right-20 min-touch p-4 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 z-20 group inline-flex items-center justify-center"
                title="Next Photo"
              >
                <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, scale: 0.9, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white p-4 sm:p-5 shadow-2xl flex flex-col items-center max-w-full relative rounded-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative overflow-hidden bg-slate-50 rounded-sm">
                    <img
                      src={shuffledImages[activeIdx].src}
                      alt={shuffledImages[activeIdx].alt}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="max-h-[65vh] sm:max-h-[70vh] md:max-h-[75vh] object-contain select-none max-w-full rounded-sm"
                    />
                  </div>
                  
                  {/* Lightbox Navigation Dots & Index Counter */}
                  <div className="w-full text-center mt-4 px-3 select-none">
                    <p className="font-serif text-[11px] text-[#03307B]/75 uppercase tracking-widest mb-4">
                      Photo {activeIdx + 1} of {shuffledImages.length}
                    </p>
                    <div className="flex justify-center gap-1">
                      {shuffledImages.map((img, i) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveIdx(i);
                          }}
                          aria-label={`Go to photo ${i + 1}`}
                          aria-current={i === activeIdx ? 'true' : undefined}
                          className="min-touch inline-flex items-center justify-center"
                        >
                          <span
                            className={`rounded-full transition-all duration-300 ${
                              i === activeIdx
                                ? 'bg-[#3A75C4] w-6 h-1.5'
                                : 'bg-[#03307B]/20 w-1.5 h-1.5'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
