/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, CalendarPlus, PlayCircle } from 'lucide-react';
import { WEDDING_CONFIG } from '../config';
import Section from './ui/Section';
import SectionHeader from './ui/SectionHeader';
import { useGuest } from '../context/GuestContext';
import { openGoogleCalendar } from '../lib/googleCalendar';

function openMap(url: string) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

interface EventCardProps {
  badge: string;
  title: string;
  subtitle?: string;
  timeLabel?: string;
  children: React.ReactNode;
  delay?: number;
}

function EventCard({ badge, title, subtitle, timeLabel, children, delay = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="border border-[#03307B]/10 bg-white p-8 sm:p-12 relative flex flex-col justify-between shadow-sm"
    >
      <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#3A75C4] text-white px-4 py-1 text-[9px] tracking-widest uppercase font-mono shadow-sm font-bold">
        {badge}
      </div>
      <div className="space-y-6">
        {timeLabel && (
          <div className="flex items-center gap-4 text-[#3A75C4]">
            <Clock className="w-5 h-5 shrink-0" />
            <span className="font-mono text-xs tracking-wider uppercase font-semibold">
              {timeLabel}
            </span>
          </div>
        )}
        <div className="space-y-1.5">
          <p className="font-serif text-2xl text-[#03307B] font-semibold">{title}</p>
          {subtitle && (
            <p className="font-sans text-sm text-[#03307B]/65 italic tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function MapsButton({ url }: { url: string }) {
  if (!url) return null;
  return (
    <button
      type="button"
      onClick={() => openMap(url)}
      className="w-full min-h-11 border border-[#3A75C4] hover:bg-[#3A75C4] hover:text-white px-4 py-3 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-sans inline-flex items-center justify-center gap-3 text-[#3A75C4] transition-all duration-300 rounded-none shadow-sm font-bold"
    >
      <MapPin className="w-4 h-4" />
      <span>Google Maps</span>
    </button>
  );
}

function CalendarButton({
  title,
  startTime,
  endTime,
  location,
  details,
}: {
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  details?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        openGoogleCalendar({
          title,
          dateYmd: WEDDING_CONFIG.weddingYYYYMMDD,
          startTime,
          endTime,
          location,
          details,
        })
      }
      className="w-full min-h-11 border border-[#03307B]/25 hover:bg-[#03307B] hover:text-white px-4 py-3 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-sans inline-flex items-center justify-center gap-3 text-[#03307B] transition-all duration-300 rounded-none shadow-sm font-bold"
    >
      <CalendarPlus className="w-4 h-4" />
      <span>Add to Google Calendar</span>
    </button>
  );
}

export default function Details() {
  const { visibility } = useGuest();
  const { showHolyMatrimonyVenue, showLiveStream, showReceptionVenue } = visibility;

  const videoUrl = WEDDING_CONFIG.vowUrl || '';
  const coupleLabel = `${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName}`;

  const hasAnyCard = showHolyMatrimonyVenue || showLiveStream || showReceptionVenue;
  if (!hasAnyCard) return null;

  const visibleCount = [showHolyMatrimonyVenue, showLiveStream, showReceptionVenue].filter(
    Boolean
  ).length;

  const holyLocation = [WEDDING_CONFIG.holyMatrimonyVenue, WEDDING_CONFIG.holyMatrimonyAddress]
    .filter(Boolean)
    .join(', ');
  const receptionLocation = [WEDDING_CONFIG.ceremonyVenue, WEDDING_CONFIG.ceremonyAddress]
    .filter(Boolean)
    .join(', ');

  return (
    <Section id="details" className="bg-white">
      <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-[#3A75C4]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
        <SectionHeader title="Event Location" />

        <div
          className={`max-w-5xl mx-auto pt-8 w-full grid grid-cols-1 gap-8 px-4 ${
            visibleCount > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1 md:max-w-xl'
          }`}
        >
          {showHolyMatrimonyVenue && (
            <EventCard
              badge="Holy Matrimony"
              title="Holy Matrimony"
              timeLabel={`${WEDDING_CONFIG.holyMatrimonyTime} WIB`}
            >
              <div className="space-y-2 font-sans text-sm text-[#03307B]/80 leading-relaxed">
                <p className="font-medium">{WEDDING_CONFIG.holyMatrimonyVenue}</p>
                {WEDDING_CONFIG.holyMatrimonyAddress && (
                  <p className="text-xs text-[#03307B]/60">
                    {WEDDING_CONFIG.holyMatrimonyAddress}
                  </p>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <MapsButton url={WEDDING_CONFIG.holyMatrimonyMapsUrl} />
                <CalendarButton
                  title={`Holy Matrimony — ${coupleLabel}`}
                  startTime={WEDDING_CONFIG.holyMatrimonyTime}
                  location={holyLocation}
                  details={`Holy Matrimony of ${coupleLabel}`}
                />
              </div>
            </EventCard>
          )}

          {showLiveStream && (
            <EventCard badge="Vow" title="Holy Matrimony Live Stream">
              <div className="flex items-center gap-3 text-[#3A75C4]">
                <Clock className="w-5 h-5 shrink-0" />
                <span className="font-mono text-xs tracking-wider uppercase font-semibold">
                  {WEDDING_CONFIG.holyMatrimonyTime} WIB
                </span>
              </div>
              {videoUrl ? (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full min-h-11 border border-[#3A75C4] hover:bg-[#3A75C4] hover:text-white px-4 py-3 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-sans inline-flex items-center justify-center gap-3 text-[#3A75C4] transition-all duration-300 rounded-none shadow-sm font-bold"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Watch Live Stream</span>
                </a>
              ) : (
                <p className="text-xs text-[#03307B]/60">Live stream link will be shared soon.</p>
              )}
              <div className="space-y-2 mt-4">
                <CalendarButton
                  title={`Holy Matrimony Live Stream — ${coupleLabel}`}
                  startTime={WEDDING_CONFIG.holyMatrimonyTime}
                  details={
                    videoUrl
                      ? `Watch the live stream: ${videoUrl}`
                      : `Holy Matrimony live stream of ${coupleLabel}`
                  }
                />
              </div>
            </EventCard>
          )}

          {showReceptionVenue && (
            <EventCard
              badge="Ceremony"
              title="Reception"
              subtitle="Standing reception"
              timeLabel={`${WEDDING_CONFIG.weddingTime} WIB - End`}
              delay={0.1}
            >
              <div className="space-y-2 font-sans text-sm text-[#03307B]/80 leading-relaxed">
                <p className="font-medium">{WEDDING_CONFIG.ceremonyVenue}</p>
                <p className="text-xs text-[#03307B]/60">{WEDDING_CONFIG.ceremonyAddress}</p>
              </div>
              <div className="space-y-2 mt-4">
                <MapsButton url={WEDDING_CONFIG.venueMapsUrl} />
                <CalendarButton
                  title={`Reception — ${coupleLabel}`}
                  startTime={WEDDING_CONFIG.weddingTime}
                  endTime="22:00"
                  location={receptionLocation}
                  details={`Wedding reception of ${coupleLabel}`}
                />
              </div>
            </EventCard>
          )}
        </div>

        {showReceptionVenue && WEDDING_CONFIG.parkingNote && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-xl mx-auto w-full px-4 pt-12 text-center space-y-3"
          >
            <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#3A75C4] font-bold">
              Parking
            </p>
            <p className="font-sans text-sm text-[#03307B]/80 leading-relaxed">
              {WEDDING_CONFIG.parkingNote}
            </p>
          </motion.div>
        )}
      </div>
    </Section>
  );
}
