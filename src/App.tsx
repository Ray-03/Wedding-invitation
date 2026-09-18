"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Heart, Menu, X, ChevronUp } from "lucide-react";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { useInvitationAudio } from "./hooks/useInvitationAudio";
import { useBodyScrollLock } from "./hooks/useBodyScrollLock";
import { useShowScrollTop } from "./hooks/useShowScrollTop";
import { WEDDING_CONFIG, getCoupleDisplayNames } from "./config";
import Cover from "./components/Cover";
import ThankYou from "./components/ThankYou";
import Footer from "./components/Footer";
import SectionSeparator from "./components/SectionSeparator";
import type { GalleryImage } from "./lib/getGalleryImages";
import { getLoadingPhotos } from "./lib/loadingPhotos";
import {
  getMenuItems,
  getVisibleSections,
  renderInvitationSection,
} from "./lib/invitationSections";
import { GuestProvider, useGuest } from "./context/GuestContext";
import InviteGate from "./components/InviteGate";
import InvitationLoader from "./components/InvitationLoader";

const BG_IMG = "/images/story/story1.webp";
const PRELOAD_IMAGES = [BG_IMG] as const;

interface AppProps {
  galleryImages: GalleryImage[];
}

function AppContent({ galleryImages }: AppProps) {
  const {
    greeting,
    visibility,
    loading: guestLoading,
    loadError,
    guest,
    refreshGuest,
  } = useGuest();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [minLoaderDone, setMinLoaderDone] = useState(false);
  const { isPlaying, play, toggle } = useInvitationAudio();
  const loadingPhotos = useMemo(
    () => getLoadingPhotos(galleryImages),
    [galleryImages],
  );
  const { groomName: displayGroomName, brideName: displayBrideName } =
    getCoupleDisplayNames(guest.inviteType);

  useImagePreloader(PRELOAD_IMAGES);
  useBodyScrollLock(!isOpen);
  const showScrollTop = useShowScrollTop(isOpen);

  useEffect(() => {
    document.title = `${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName} - Wedding Invitation`;
  }, []);

  // Keep the photo flipbook brief — long waits feel broken on slow iPhone networks.
  useEffect(() => {
    const t = window.setTimeout(() => setMinLoaderDone(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  const handleOpenInvitation = () => {
    startTransition(() => {
      setIsOpen(true);
    });
    play();
  };

  const handleNavigate = (id: string) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sections = getVisibleSections(visibility);
  const activeMenuItems = getMenuItems(visibility);

  if (guestLoading || !minLoaderDone) {
    return <InvitationLoader photos={loadingPhotos} />;
  }

  if (loadError) {
    return (
      <InviteGate
        reason="error"
        onRetry={() => void refreshGuest()}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen text-[#03307B] selection:bg-[#3A75C4] selection:text-white font-sans relative">
      <div className="fixed top-0 inset-x-0 z-50 pointer-events-none p-4 sm:p-6 flex justify-between items-center bg-transparent">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="music-control"
              initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#03307B]/15 p-1.5 pl-3 rounded-full shadow-lg"
            >
              {isPlaying && (
                <div className="flex items-end gap-[2.5px] h-3.5 px-1.5 shrink-0">
                  <span
                    className="w-[1.5px] bg-[#3A75C4] animate-bounce rounded-full"
                    style={{ height: "100%", animationDuration: "0.6s" }}
                  />
                  <span
                    className="w-[1.5px] bg-[#3A75C4] animate-bounce rounded-full"
                    style={{ height: "60%", animationDuration: "0.8s" }}
                  />
                  <span
                    className="w-[1.5px] bg-[#3A75C4] animate-bounce rounded-full"
                    style={{ height: "80%", animationDuration: "0.5s" }}
                  />
                </div>
              )}
              <motion.button
                onClick={toggle}
                className={`min-touch p-3 rounded-full transition-colors duration-300 inline-flex items-center justify-center cursor-pointer ${
                  isPlaying
                    ? "bg-[#03307B] text-white shadow-md shadow-[#03307B]/20"
                    : "bg-[#03307B]/5 text-[#03307B]"
                }`}
                title={isPlaying ? "Mute Music" : "Play Music"}
                aria-label="Toggle Music"
              >
                {isPlaying ? (
                  <Volume2 className="w-4 h-4 pointer-events-none" />
                ) : (
                  <VolumeX className="w-4 h-4 pointer-events-none" />
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="pointer-events-auto min-touch p-3 inline-flex items-center justify-center bg-white/90 backdrop-blur-md border border-[#03307B]/10 rounded-full shadow-lg text-[#03307B] hover:bg-[#03307B] hover:text-white hover:border-[#03307B] transition-all duration-300"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l border-[#03307B]/10 shadow-2xl z-45 p-12 flex flex-col justify-between"
            >
              <div className="pt-8 text-right">
                <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#3A75C4] font-bold block">
                  Navigation Menu
                </span>
                <div className="w-8 h-[1px] bg-[#3A75C4] mt-2 ml-auto" />
              </div>

              <nav className="flex flex-col space-y-6 my-auto pt-4 text-right">
                {activeMenuItems.map((item, index) => (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="flex items-baseline justify-end gap-4 group w-full"
                  >
                    <span className="font-mono text-xs text-[#3A75C4] font-medium tracking-wider">
                      {item.number}
                    </span>
                    <span className="font-serif text-2xl sm:text-3xl text-[#03307B] hover:text-[#3A75C4] group-hover:-translate-x-2 transition-all duration-300 tracking-wide font-medium">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </nav>

              <div className="space-y-2 border-t border-[#03307B]/10 pt-6 text-right">
                <p className="font-serif text-sm italic text-[#03307B]">
                  {displayGroomName} &amp; {displayBrideName}
                </p>
                <p className="font-mono text-[9px] tracking-widest text-[#3A75C4] uppercase font-semibold">
                  {WEDDING_CONFIG.weddingDateNumeric}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
          >
            <img
              src={BG_IMG}
              alt="Pre-wedding Background"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-[0.08] sepia-[0.1]"
            />
            <div className="absolute inset-0 bg-white/85" />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative w-full">
        <Cover
          onOpen={handleOpenInvitation}
          isOpen={isOpen}
          guestGreeting={greeting}
        />

        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-95 z-20 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#03307B] font-semibold text-center w-full max-w-[280px] px-4 pointer-events-none">
              <span>{displayGroomName}</span>
              <Heart className="w-3 h-3 text-[#3A75C4] fill-current" />
              <span>{displayBrideName}</span>
            </div>

            {sections.map((section, idx) => (
              <React.Fragment key={section.id}>
                {renderInvitationSection(section, galleryImages)}
                {idx < sections.length - 1 && <SectionSeparator />}
              </React.Fragment>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <ThankYou />
            </motion.div>

            <Footer />
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {isOpen && showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 min-touch p-3 rounded-full bg-white/90 backdrop-blur-md border border-[#03307B]/15 text-[#03307B] hover:bg-[#03307B] hover:text-white hover:border-[#03307B] shadow-xl transition-all duration-300 pointer-events-auto inline-flex items-center justify-center cursor-pointer"
            aria-label="Back to Top"
          >
            <ChevronUp className="w-5 h-5 pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App({ galleryImages }: AppProps) {
  return (
    <GuestProvider>
      <AppContent galleryImages={galleryImages} />
    </GuestProvider>
  );
}
