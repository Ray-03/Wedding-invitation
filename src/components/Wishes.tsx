/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CalendarOff,
} from "lucide-react";
import Section from "./ui/Section";
import SectionHeader from "./ui/SectionHeader";
import { useGuest } from "../context/GuestContext";
import { GUESTS_COLLECTION } from "../lib/guests";
import { formatGuestDisplayName, type RsvpStatus } from "../types/guest";
import { WEDDING_CONFIG } from "../config";
import { useGuestbookResponses } from "../hooks/useGuestbookResponses";
import { usePagination } from "../hooks/usePagination";
import {
  logFirestoreError,
  submitWishAndRsvp,
  validateWishForm,
  type WishFormErrors,
} from "../lib/wishes";

const WISHES_PER_PAGE = 4;

export default function Wishes() {
  const {
    guest,
    isRegistered,
    loading: guestLoading,
    patchGuest,
  } = useGuest();
  const {
    responses,
    totalCount,
    loadingMore,
    refresh: refreshGuestbook,
    ensureLoaded,
  } = useGuestbookResponses();
  const { page, setPage, totalPages, pageNumbers, slice } = usePagination(
    responses.length,
    WISHES_PER_PAGE,
    totalCount,
  );
  const paginatedResponses = slice(responses);

  const goToPage = async (nextPage: number) => {
    const target = Math.min(Math.max(1, nextPage), totalPages);
    await ensureLoaded(target * WISHES_PER_PAGE);
    setPage(target);
  };

  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null);
  const [attendingCount, setAttendingCount] = useState<1 | 2 | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<WishFormErrors>({});

  const alreadyWished = Boolean(guest.wish?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyWished || submitting || !WEDDING_CONFIG.isRsvpOpen) return;

    const guestName = isRegistered
      ? guest.name
      : displayName.trim();

    const newErrors = validateWishForm({
      name: guestName,
      requireName: !isRegistered,
      message,
      rsvpStatus,
      attendingCount,
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const wishText = message.trim();
    const count = rsvpStatus === "Attending" ? (attendingCount as 1 | 2) : 0;

    try {
      await submitWishAndRsvp({
        guestId: isRegistered ? guest.id : undefined,
        guestName,
        guestTitle: isRegistered ? guest.title : undefined,
        wishText,
        rsvpStatus: rsvpStatus as RsvpStatus,
        attendingCount: count,
      });

      if (isRegistered) {
        patchGuest({
          wish: wishText,
          rsvpStatus: rsvpStatus ?? undefined,
          attendingCount: count,
        });
      }
      setDisplayName("");
      setMessage("");
      setRsvpStatus(null);
      setAttendingCount(null);
      setSubmitted(true);
      setPage(1);
      void refreshGuestbook();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      logFirestoreError(error, "write", `${GUESTS_COLLECTION}/${guest.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormArea = () => {
    if (guestLoading) {
      return (
        <p className="font-sans text-sm text-[#03307B]/80 pt-8">
          Loading your invitation…
        </p>
      );
    }

    if (alreadyWished) {
      return (
        <WishStatusCard
          icon={<Heart className="w-6 h-6 text-[#3A75C4] fill-current" />}
          title="Thank You"
          body="Your message and attendance confirmation have been received. Thank you for filling out our guestbook!"
          className="p-10"
        />
      );
    }

    if (!WEDDING_CONFIG.isRsvpOpen) {
      return (
        <WishStatusCard
          icon={<CalendarOff className="w-6 h-6 text-[#3A75C4]" />}
          title="RSVP Closed"
          body={
            WEDDING_CONFIG.rsvpCloseDateLabel
              ? `Reservation closed on ${WEDDING_CONFIG.rsvpCloseDateLabel}. Thank you for your kind attention.`
              : "Reservation is no longer available. Thank you for your kind attention."
          }
        />
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-8 max-w-md w-full pt-8">
        <div className="relative group">
          <input
            type="text"
            value={
              isRegistered
                ? formatGuestDisplayName(guest.name, guest.title)
                : displayName
            }
            readOnly={isRegistered}
            onChange={(e) => {
              if (isRegistered) return;
              setDisplayName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder=" "
            className={`w-full bg-transparent border-b py-3 outline-none font-sans text-sm tracking-wide peer ${
              isRegistered
                ? "border-[#03307B]/20 text-[#03307B] cursor-default"
                : errors.name
                  ? "border-red-400 text-[#03307B]"
                  : "border-[#03307B]/30 text-[#03307B] focus:border-[#3A75C4]"
            }`}
          />
          <label className="absolute left-0 top-[-12px] text-[10px] tracking-wider uppercase font-sans text-[#03307B]/70 pointer-events-none">
            Full Name
          </label>
          {errors.name && (
            <span className="text-[10px] text-red-500 font-sans mt-1 block">
              {errors.name}
            </span>
          )}
        </div>

        <div className="relative group">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors({ ...errors, message: undefined });
            }}
            rows={4}
            placeholder=" "
            className={`w-full bg-transparent border-b ${errors.message ? "border-red-400" : "border-[#03307B]/30"} py-3 outline-none font-sans text-sm tracking-wide focus:border-[#3A75C4] transition-colors resize-none peer`}
          />
          <label
            className={`absolute left-0 top-3 ${errors.message ? "text-red-400" : "text-[#03307B]/70"} text-xs tracking-wider uppercase font-sans pointer-events-none transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:top-[-12px] peer-focus:text-[10px] peer-focus:text-[#3A75C4] peer-[:not(:placeholder-shown)]:top-[-12px] peer-[:not(:placeholder-shown)]:text-[10px]`}
          >
            Write Message & Prayer
          </label>
          {errors.message && (
            <span className="text-[10px] text-red-500 font-sans mt-1 block">
              {errors.message}
            </span>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <span
            className={`text-[10px] tracking-widest uppercase font-sans block ${errors.rsvp ? "text-red-500" : "text-[#03307B]/70"}`}
          >
            RSVP Confirmation{" "}
            {errors.rsvp && (
              <span className="lowercase normal-case italic ml-1">
                ({errors.rsvp})
              </span>
            )}
          </span>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { id: "Attending", label: "Attending" },
                { id: "Declined", label: "Declined" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setRsvpStatus(option.id);
                  if (option.id === "Declined") setAttendingCount(null);
                  if (errors.rsvp || errors.attendingCount) {
                    setErrors({
                      ...errors,
                      rsvp: undefined,
                      attendingCount: undefined,
                    });
                  }
                }}
                className={`min-h-11 py-3 text-[10px] tracking-widest uppercase font-sans border transition-all duration-300 inline-flex items-center justify-center ${
                  rsvpStatus === option.id
                    ? "bg-[#03307B] text-white border-[#03307B]"
                    : errors.rsvp
                      ? "bg-transparent text-red-400 border-red-200 hover:border-red-400"
                      : "bg-transparent text-[#03307B]/80 border-[#03307B]/20 hover:border-[#03307B]/40"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {rsvpStatus === "Attending" && (
            <div className="space-y-3 pt-2">
              <span
                className={`text-[10px] tracking-widest uppercase font-sans block ${errors.attendingCount ? "text-red-500" : "text-[#03307B]/70"}`}
              >
                How many attending?{" "}
                {errors.attendingCount && (
                  <span className="lowercase normal-case italic ml-1">
                    ({errors.attendingCount})
                  </span>
                )}
              </span>
              <div className="flex items-center gap-3">
                {([1, 2] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    aria-label={`${count} attending`}
                    aria-pressed={attendingCount === count}
                    onClick={() => {
                      setAttendingCount(count);
                      if (errors.attendingCount) {
                        setErrors({ ...errors, attendingCount: undefined });
                      }
                    }}
                    className={`min-touch w-11 h-11 rounded-full font-mono text-sm font-semibold border transition-all duration-300 inline-flex items-center justify-center ${
                      attendingCount === count
                        ? "bg-[#03307B] text-white border-[#03307B]"
                        : errors.attendingCount
                          ? "bg-transparent text-red-400 border-red-200 hover:border-red-400"
                          : "bg-transparent text-[#03307B]/70 border-[#03307B]/25 hover:border-[#03307B]/50"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-11 bg-[#03307B] hover:bg-[#3A75C4] disabled:opacity-60 text-white py-4 uppercase tracking-[0.2em] text-xs font-sans transition-colors duration-300 inline-flex items-center justify-center gap-3 rounded-none shadow-md font-medium"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Sending…" : "Send Message"}</span>
          </button>

          <AnimatePresence>
            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-[#8A9A86] font-sans tracking-wide text-center font-medium"
              >
                Thank you! Your message and prayer have been saved in our
                Guestbook.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>
    );
  };

  return (
    <Section id="wishes" className="overflow-hidden">
      <div className="absolute top-[20%] left-0 font-serif text-[18vw] leading-none text-[#03307B]/[0.02] uppercase select-none pointer-events-none whitespace-nowrap z-0 font-bold">
        GUEST BOOK • GUEST BOOK • GUEST BOOK
      </div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 rounded-full bg-[#3A75C4]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 rounded-full bg-[#03307B]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <SectionHeader
            label="Digital Guestbook"
            title="Guest Book"
            description="It is our pleasure if you could leave a message of blessing and confirm your attendance."
            className="md:items-start md:text-left"
          />
          {renderFormArea()}
        </div>

        <div className="space-y-6 bg-white p-6 sm:p-8 border border-[#03307B]/5 shadow-sm flex flex-col w-full min-h-[420px]">
          <div className="flex items-center justify-between border-b border-[#03307B]/10 pb-4 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-4 h-4 text-[#3A75C4] shrink-0" />
              <h3 className="font-serif text-xl font-medium tracking-wide text-[#03307B]">
                Guestbook
              </h3>
            </div>
            <span className="font-mono text-[10px] sm:text-xs text-[#3A75C4] font-bold inline-flex items-center gap-1.5 bg-white px-2.5 sm:px-3 py-1 shadow-sm border border-[#03307B]/5 shrink-0">
              <Heart className="w-3 h-3 fill-current" />
              <span>
                {totalCount > 0 ? totalCount : responses.length} Messages
              </span>
            </span>
          </div>

          <div className="space-y-5 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {paginatedResponses.length === 0 ? (
                  <p className="font-serif italic text-sm text-[#03307B]/75 text-center py-12">
                    {loadingMore
                      ? "Loading messages…"
                      : "No messages yet. Be the first to leave a wish."}
                  </p>
                ) : (
                  paginatedResponses.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 sm:p-5 shadow-sm border border-[#03307B]/5 border-l-2 border-l-[#3A75C4] space-y-2.5 hover:border-l-4 transition-all duration-300"
                    >
                      <strong className="block font-sans text-sm text-[#03307B] font-semibold break-words">
                        {formatGuestDisplayName(item.name, item.title)}
                      </strong>
                      <p className="font-sans text-xs text-[#03307B]/85 leading-relaxed italic">
                        &quot;{item.message}&quot;
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {(totalCount > WISHES_PER_PAGE || responses.length > WISHES_PER_PAGE) && (
            <div className="pt-3 border-t border-[#03307B]/10 w-full flex flex-col gap-2.5">
              <p className="font-mono text-[10px] tracking-wider uppercase text-[#03307B]/45 whitespace-nowrap text-center">
                Page {page} of {totalPages}
                {loadingMore ? " · Loading…" : ""}
              </p>
              <div className="w-full flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void goToPage(page - 1)}
                  disabled={page <= 1 || loadingMore}
                  aria-label="Previous page"
                  className="size-9 shrink-0 inline-flex items-center justify-center border border-[#03307B]/15 text-[#03307B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#03307B] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0 flex flex-nowrap items-center justify-center gap-0.5">
                  {pageNumbers.map((num, idx) => {
                    const prev = pageNumbers[idx - 1];
                    const showEllipsis = prev != null && num - prev > 1;
                    return (
                      <React.Fragment key={num}>
                        {showEllipsis && (
                          <span className="px-1 font-mono text-[10px] text-[#03307B]/35 select-none shrink-0">
                            …
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => void goToPage(num)}
                          disabled={loadingMore}
                          aria-label={`Go to page ${num}`}
                          aria-current={page === num ? "page" : undefined}
                          className={`size-9 shrink-0 font-mono text-[11px] border transition-colors inline-flex items-center justify-center disabled:opacity-50 ${
                            page === num
                              ? "bg-[#03307B] text-white border-[#03307B]"
                              : "border-[#03307B]/15 text-[#03307B]/70 hover:border-[#03307B]/40 hover:text-[#03307B]"
                          }`}
                        >
                          {num}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => void goToPage(page + 1)}
                  disabled={page >= totalPages || loadingMore}
                  aria-label="Next page"
                  className="size-9 shrink-0 inline-flex items-center justify-center border border-[#03307B]/15 text-[#03307B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#03307B] hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

function WishStatusCard({
  icon,
  title,
  body,
  className = "p-8 sm:p-10",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-[#03307B]/5 border border-[#03307B]/15 ${className} mt-8 rounded-none text-center space-y-4 max-w-md`}
    >
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-[#03307B]/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h4 className="font-serif text-xl text-[#03307B]">{title}</h4>
      <p className="font-sans text-sm text-[#03307B]/70 leading-relaxed">
        {body}
      </p>
    </motion.div>
  );
}
