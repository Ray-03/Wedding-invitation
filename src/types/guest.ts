export type InviteType = 'physical' | 'livestream' | 'both' | 'special';
export type RsvpStatus = 'Attending' | 'Declined';

export interface Guest {
  id: string;
  name: string;
  /** Optional honorific, e.g. Mr. / Mrs. / Ms. / Dear */
  title?: string;
  /**
   * physical   → Holy Matrimony venue only
   * livestream → Live stream + reception
   * both       → Holy Matrimony venue + reception (no livestream)
   * special    → Live stream link only (no venues)
   */
  inviteType: InviteType;
  /** Derived from inviteType: physical = false, otherwise true */
  showStory: boolean;
  /** Guestbook message saved on the guest document */
  wish?: string;
  rsvpStatus?: RsvpStatus;
  /** Number of people attending (1–2). 0 when Declined. */
  attendingCount?: number;
  /**
   * Optional mirror of NEXT_PUBLIC_RSVP_CLOSE_DATE (ddmmyyyy / YYYY-MM-DD).
   * Site RSVP gate uses the env config; this is kept for guest docs / tooling.
   */
  rsvpCloseDate?: string;
}

export const GENERAL_GUEST_GREETING = 'Dear guest';

export const DEFAULT_GUEST: Guest = {
  id: '',
  name: '',
  inviteType: 'livestream',
  showStory: true,
};

export function formatGuestGreeting(guest: Guest): string {
  const name = guest.name?.trim();
  if (!name || guest.id === '') {
    return GENERAL_GUEST_GREETING;
  }

  const display = formatGuestDisplayName(guest.name, guest.title);
  return `To: ${display}`;
}

/**
 * Display name with honorific, e.g. "Mr. & Mrs. Yohannes Billy Harianto".
 * Matches Chat WA / cover greeting conventions (Dear without trailing period).
 */
export function formatGuestDisplayName(
  name: string | undefined,
  title?: string | null,
): string {
  const n = (name || '').trim();
  if (!n) return '';

  const t = (title || '').trim();
  if (!t) return n;

  if (/^dear$/i.test(t.replace(/\.$/, ''))) {
    return `Dear ${n}`;
  }

  const normalized = /[.]$/.test(t) ? t : `${t}.`;
  return `${normalized} ${n}`.replace(/\s+/g, ' ').trim();
}

export function guestVisibility(guest: Guest) {
  const { inviteType } = guest;
  return {
    showHolyMatrimonyVenue: inviteType === 'physical' || inviteType === 'both',
    showLiveStream: inviteType === 'livestream' || inviteType === 'special',
    showReceptionVenue: inviteType === 'livestream' || inviteType === 'both',
    showStory: inviteType !== 'physical',
  };
}
