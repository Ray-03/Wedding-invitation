/**
 * Shared WhatsApp invite message builder for import/export scripts.
 */

function env(key, fallback = '') {
  const value = process.env[key];
  if (value == null || String(value).trim() === '') return fallback;
  return String(value).trim().replace(/^["']|["']$/g, '');
}

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function parseCalendarDate(raw) {
  const clean = String(raw || '').trim();
  if (/^\d{8}$/.test(clean)) {
    return {
      day: parseInt(clean.slice(0, 2), 10),
      month: parseInt(clean.slice(2, 4), 10),
      year: parseInt(clean.slice(4, 8), 10),
    };
  }
  const iso = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!iso) return null;
  return {
    year: parseInt(iso[1], 10),
    month: parseInt(iso[2], 10),
    day: parseInt(iso[3], 10),
  };
}

function formatDateId(raw) {
  const parsed = parseCalendarDate(raw);
  if (!parsed) return raw || '';
  const { day, month, year } = parsed;
  return `${day} ${MONTHS_ID[month - 1] || ''} ${year}`.replace(/\s+/g, ' ').trim();
}

/** Fixed RSVP close date from env (ddmmyyyy / YYYY-MM-DD). */
export function getConfiguredRsvpCloseDate() {
  return env('NEXT_PUBLIC_RSVP_CLOSE_DATE', '10082026');
}

export function formatRsvpCloseLabel(raw) {
  return formatDateId(raw);
}

function formatTimeLabel(time) {
  const t = String(time || '').trim();
  if (!t) return '';
  return `${t} WIB`;
}

/** WhatsApp bold */
function bold(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  return `*${value}*`;
}

export function getInviteMessageConfig() {
  const groomName = env('NEXT_PUBLIC_GROOM_NAME', 'John Doe');
  const brideName = env('NEXT_PUBLIC_BRIDE_NAME', 'Jane Doe');
  const weddingDateRaw = env('NEXT_PUBLIC_WEDDING_DATE', '15082026');
  const weddingTime = env('NEXT_PUBLIC_WEDDING_TIME', '18:00');
  const holyTime = env('NEXT_PUBLIC_HOLY_MATRIMONY_TIME', '10:00');
  const holyVenue = env('NEXT_PUBLIC_HOLY_MATRIMONY_VENUE', 'Holy Matrimony Venue');
  const receptionVenue = env('NEXT_PUBLIC_VENUE_NAME', 'Reception Venue');
  const brideFather = env('NEXT_PUBLIC_BRIDE_FATHER_NAME');
  const brideMother = env('NEXT_PUBLIC_BRIDE_MOTHER_NAME');
  const rsvpCloseRaw = getConfiguredRsvpCloseDate();

  const physicalVenue = env(
    'INVITE_MESSAGE_PHYSICAL_VENUE',
    `${holyVenue}, Lantai 3`
  );
  const livestreamVenue = env(
    'INVITE_MESSAGE_LIVESTREAM_VENUE',
    receptionVenue
  );

  const parentsLabel =
    [brideFather, brideMother].filter(Boolean).join(' & ') || 'The Family';

  return {
    groomName,
    brideName,
    weddingDateLabel: formatDateId(weddingDateRaw),
    rsvpCloseDate: rsvpCloseRaw,
    rsvpCloseLabel: formatDateId(rsvpCloseRaw) || '10 Agustus 2026',
    parentsLabel,
    physicalTime: formatTimeLabel(holyTime),
    livestreamTime: formatTimeLabel(weddingTime),
    physicalVenue,
    livestreamVenue,
  };
}

export function resolveEventDetails(inviteType, config = getInviteMessageConfig()) {
  if (inviteType === 'both') {
    return {
      eventTimeLabel: `${config.physicalTime} & ${config.livestreamTime}`,
      venueLabel: `${config.physicalVenue} & ${config.livestreamVenue}`,
      locationLine: `Tempat: ${bold(`${config.physicalVenue} & ${config.livestreamVenue}`)}`,
    };
  }
  if (inviteType === 'special') {
    return {
      eventTimeLabel: config.physicalTime,
      venueLabel: 'Live Stream',
      locationLine: `Via: ${bold('Live Stream')}`,
    };
  }
  if (inviteType === 'physical') {
    return {
      eventTimeLabel: config.physicalTime,
      venueLabel: config.physicalVenue,
      locationLine: `Tempat: ${bold(config.physicalVenue)}`,
    };
  }
  return {
    eventTimeLabel: config.livestreamTime,
    venueLabel: config.livestreamVenue,
    locationLine: `Tempat: ${bold(config.livestreamVenue)}`,
  };
}

export function formatGuestDisplayName(name, title = '') {
  const n = String(name || '').trim();
  const t = String(title || '').trim();
  if (!n) return '';
  return t ? `${t} ${n}`.replace(/\s+/g, ' ').trim() : n;
}

/**
 * Build WhatsApp-ready invite message (formal / from parents).
 * Dynamic filled values are wrapped with * * for bold.
 */
export function buildInviteMessage({
  guestName,
  inviteType,
  inviteUrl,
  config = getInviteMessageConfig(),
}) {
  const { eventTimeLabel, venueLabel, locationLine } = resolveEventDetails(
    inviteType,
    config,
  );

  const coupleLabel = [config.groomName, config.brideName]
    .filter(Boolean)
    .join(' & ');

  return {
    eventTimeLabel,
    venueLabel,
    rsvpCloseDate: config.rsvpCloseDate || '',
    rsvpCloseLabel: config.rsvpCloseLabel,
    message: [
      `Yth. ${bold(guestName)},`,
      '',
      'Dengan anugerah dan kasih karunia Tuhan, kami dengan hormat mengundang kehadiran Bapak/Ibu/Saudara/i untuk menghadiri pernikahan anak kami,',
      '',
      bold(config.groomName),
      '&',
      bold(config.brideName),
      '',
      'yang akan dilaksanakan pada:',
      '',
      bold(config.weddingDateLabel),
      bold(eventTimeLabel),
      locationLine,
      '',
      `Apabila bapak/ibu berkenan menghadiri acara pernikahan anak kami, mohon kesediaannya untuk mengisi konfirmasi kehadiran (RSVP) melalui tautan di bawah ini sebelum ${bold(config.rsvpCloseLabel)}.`,
      '',
      inviteUrl,
      '',
      'Salam hangat,',
      bold(config.parentsLabel),
      bold(coupleLabel),
    ].join('\n'),
  };
}
