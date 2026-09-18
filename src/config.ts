/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  formatWeddingDate,
  getRsvpCloseConfig,
} from './lib/dateFormat';

// Centralized Wedding Profile configurations dynamically loaded from env or secrets
const publicEnv = {
  GROOM_NAME: process.env.NEXT_PUBLIC_GROOM_NAME,
  BRIDE_NAME: process.env.NEXT_PUBLIC_BRIDE_NAME,
  GROOM_NAME_LIVESTREAM: process.env.NEXT_PUBLIC_GROOM_NAME_LIVESTREAM,
  BRIDE_NAME_LIVESTREAM: process.env.NEXT_PUBLIC_BRIDE_NAME_LIVESTREAM,
  WEDDING_DATE: process.env.NEXT_PUBLIC_WEDDING_DATE,
  WEDDING_TIME: process.env.NEXT_PUBLIC_WEDDING_TIME,
  VENUE_NAME: process.env.NEXT_PUBLIC_VENUE_NAME,
  VENUE_ADDRESS: process.env.NEXT_PUBLIC_VENUE_ADDRESS,
  VENUE_MAPS_URL: process.env.NEXT_PUBLIC_VENUE_MAPS_URL,
  HOLY_MATRIMONY_VENUE: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_VENUE,
  HOLY_MATRIMONY_ADDRESS: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_ADDRESS,
  HOLY_MATRIMONY_MAPS_URL: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_MAPS_URL,
  VOW_URL: process.env.NEXT_PUBLIC_VOW_URL,
  BIBLE_QUOTE: process.env.NEXT_PUBLIC_BIBLE_QUOTE,
  BIBLE_VERSE: process.env.NEXT_PUBLIC_BIBLE_VERSE,
  STORY_QUOTE: process.env.NEXT_PUBLIC_STORY_QUOTE,
  STORY_QUOTE_SOURCE: process.env.NEXT_PUBLIC_STORY_QUOTE_SOURCE,
  HOLY_MATRIMONY_TIME: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_TIME,
  GROOM_QUOTE: process.env.NEXT_PUBLIC_GROOM_QUOTE,
  BRIDE_QUOTE: process.env.NEXT_PUBLIC_BRIDE_QUOTE,
  GROOM_FATHER_NAME: process.env.NEXT_PUBLIC_GROOM_FATHER_NAME,
  GROOM_MOTHER_NAME: process.env.NEXT_PUBLIC_GROOM_MOTHER_NAME,
  BRIDE_FATHER_NAME: process.env.NEXT_PUBLIC_BRIDE_FATHER_NAME,
  BRIDE_MOTHER_NAME: process.env.NEXT_PUBLIC_BRIDE_MOTHER_NAME,
  RSVP_CLOSE_DATE: process.env.NEXT_PUBLIC_RSVP_CLOSE_DATE,
  PARKING_NOTE: process.env.NEXT_PUBLIC_PARKING_NOTE,
  GROOM_BANK_NAME: process.env.NEXT_PUBLIC_GROOM_BANK_NAME,
  GROOM_BANK_ACCOUNT: process.env.NEXT_PUBLIC_GROOM_BANK_ACCOUNT,
  GROOM_BANK_HOLDER: process.env.NEXT_PUBLIC_GROOM_BANK_HOLDER,
  BRIDE_BANK_NAME: process.env.NEXT_PUBLIC_BRIDE_BANK_NAME,
  BRIDE_BANK_ACCOUNT: process.env.NEXT_PUBLIC_BRIDE_BANK_ACCOUNT,
  BRIDE_BANK_HOLDER: process.env.NEXT_PUBLIC_BRIDE_BANK_HOLDER,
};

function getEnv(key: keyof typeof publicEnv, fallback = '') {
  return publicEnv[key] ?? fallback;
}

function getInitialFromName(name: string): string {
  if (!name) return '';
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter(Boolean);

  return words.length > 0 ? words[0][0].toUpperCase() : '';
}

const groomName = getEnv('GROOM_NAME', 'John Doe');
const brideName = getEnv('BRIDE_NAME', 'Jane Doe');
const groomNameLivestream = getEnv('GROOM_NAME_LIVESTREAM', 'John Doe');
const brideNameLivestream = getEnv('BRIDE_NAME_LIVESTREAM', 'Jane Doe');

const formattedDate = formatWeddingDate(
  getEnv('WEDDING_DATE', '12122026'),
  getEnv('WEDDING_TIME', '09:00')
);

const holyMatrimonyFormatted = formatWeddingDate(
  getEnv('WEDDING_DATE', '12122026'),
  getEnv('HOLY_MATRIMONY_TIME') || getEnv('WEDDING_TIME', '09:00')
);

const venueName = getEnv('VENUE_NAME') || 'Reception Venue';
const venueAddress = getEnv('VENUE_ADDRESS') || 'Venue address';
const rsvpClose = getRsvpCloseConfig(getEnv('RSVP_CLOSE_DATE'));

export const WEDDING_CONFIG = {
  groomName,
  brideName,
  /** Shorter names shown on livestream invitations */
  groomNameLivestream,
  brideNameLivestream,
  groomInitial: getInitialFromName(groomName),
  brideInitial: getInitialFromName(brideName),
  weddingDate: formattedDate.readable,
  weddingDateNumeric: formattedDate.numeric,
  weddingTimestamp: formattedDate.timestamp,
  weddingYYYYMMDD: formattedDate.yyyymmdd,
  weddingTime: formattedDate.timeFormatted,
  holyMatrimonyTime: holyMatrimonyFormatted.timeFormatted,
  /** Countdown target for physical / holy matrimony guests */
  holyMatrimonyTimestamp: holyMatrimonyFormatted.timestamp,
  weddingYear: formattedDate.numeric.split(' . ').pop() || '2026',
  groomFullName: groomName,
  brideFullName: brideName,
  groomQuote: getEnv('GROOM_QUOTE') ?? '',
  brideQuote: getEnv('BRIDE_QUOTE') ?? '',
  venueName,
  venueAddress,
  venueMapsUrl: getEnv('VENUE_MAPS_URL') ?? '',
  holyMatrimonyVenue: getEnv('HOLY_MATRIMONY_VENUE') ?? 'Holy Matrimony',
  holyMatrimonyAddress: getEnv('HOLY_MATRIMONY_ADDRESS') ?? '',
  holyMatrimonyMapsUrl: getEnv('HOLY_MATRIMONY_MAPS_URL') ?? '',
  storyQuote: getEnv('STORY_QUOTE') || 'Our love story begins with a small encounter.',
  storyQuoteSource: getEnv('STORY_QUOTE_SOURCE') || 'The Couple',
  bibleQuote:
    getEnv('BIBLE_QUOTE') ??
    "Yours is the light by which my spirit's born: you are my sun, my moon, and all my stars",
  bibleQuoteSource: getEnv('BIBLE_VERSE') ?? 'E.E. Cummings',
  vowUrl: getEnv('VOW_URL') ?? '',
  ceremonyVenue: venueName,
  ceremonyAddress: venueAddress,
  /** Last day RSVP is accepted (inclusive). Empty string if unset. */
  rsvpCloseDateLabel: rsvpClose.label,
  /** False after end of RSVP close date */
  isRsvpOpen: rsvpClose.isOpen,
  groomFatherName: getEnv('GROOM_FATHER_NAME'),
  groomMotherName: getEnv('GROOM_MOTHER_NAME'),
  brideFatherName: getEnv('BRIDE_FATHER_NAME'),
  brideMotherName: getEnv('BRIDE_MOTHER_NAME'),
  parkingNote: getEnv('PARKING_NOTE'),
  giftAccounts: [
    {
      bankName: getEnv('GROOM_BANK_NAME'),
      accountNumber: getEnv('GROOM_BANK_ACCOUNT'),
      accountHolder: getEnv('GROOM_BANK_HOLDER') || groomName,
    },
    {
      bankName: getEnv('BRIDE_BANK_NAME'),
      accountNumber: getEnv('BRIDE_BANK_ACCOUNT'),
      accountHolder: getEnv('BRIDE_BANK_HOLDER') || brideName,
    },
  ].filter((account) => account.bankName && account.accountNumber),
};

/** Display names for cover / chrome — livestream/both/special use shorter names from env. */
export function getCoupleDisplayNames(
  inviteType: 'physical' | 'livestream' | 'both' | 'special',
) {
  if (inviteType === 'physical') {
    return {
      groomName: WEDDING_CONFIG.groomName,
      brideName: WEDDING_CONFIG.brideName,
    };
  }
  return {
    groomName: WEDDING_CONFIG.groomNameLivestream,
    brideName: WEDDING_CONFIG.brideNameLivestream,
  };
}
