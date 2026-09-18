/**
 * Shared date/time parsing helpers used by wedding config.
 * Pure functions — no env access.
 */

export function pad2(num: number) {
  return String(num).padStart(2, '0');
}

/** English long date, e.g. "Saturday, 15 August 2026" */
export function formatLongDateEn(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** English medium date, e.g. "1 August 2026" */
export function formatMediumDateEn(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export interface ParsedCalendarDate {
  day: number;
  month: number;
  year: number;
}

/** Parse ddmmyyyy or YYYY-MM-DD. Returns null if invalid. */
export function parseCalendarDate(raw: string): ParsedCalendarDate | null {
  const clean = (raw || '').trim();
  if (!clean) return null;

  if (/^\d{8}$/.test(clean)) {
    return {
      day: parseInt(clean.substring(0, 2), 10),
      month: parseInt(clean.substring(2, 4), 10),
      year: parseInt(clean.substring(4, 8), 10),
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

export function parseTimeOfDay(timeStr: string, fallbackHour = 9, fallbackMinute = 0) {
  const match = (timeStr || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return { hour: fallbackHour, minute: fallbackMinute };
  }
  return {
    hour: parseInt(match[1], 10),
    minute: parseInt(match[2], 10),
  };
}

export interface FormattedWeddingDate {
  readable: string;
  numeric: string;
  timestamp: number;
  yyyymmdd: string;
  timeFormatted: string;
}

export function formatWeddingDate(
  rawDate: string,
  timeStr: string,
  fallbackReadable = formatLongDateEn(new Date(2026, 11, 12))
): FormattedWeddingDate {
  const { hour, minute } = parseTimeOfDay(timeStr);
  const parsed = parseCalendarDate(rawDate);

  if (parsed && /^\d{8}$/.test((rawDate || '').trim())) {
    const { day, month, year } = parsed;
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const yearStr = String(year);
    const dateObj = new Date(year, month - 1, day, hour, minute, 0);
    if (!isNaN(dateObj.getTime())) {
      return {
        readable: formatLongDateEn(dateObj),
        numeric: `${dayStr} . ${monthStr} . ${yearStr}`,
        timestamp: dateObj.getTime(),
        yyyymmdd: `${yearStr}${monthStr}${dayStr}`,
        timeFormatted: `${pad2(hour)}:${pad2(minute)}`,
      };
    }
  }

  return {
    readable: rawDate || fallbackReadable,
    numeric: '12 . 12 . 2026',
    timestamp: new Date(2026, 11, 12, hour, minute, 0).getTime(),
    yyyymmdd: '20261212',
    timeFormatted: `${pad2(hour)}:${pad2(minute)}`,
  };
}

export interface RsvpCloseConfig {
  deadline: Date | null;
  label: string;
  isOpen: boolean;
}

/**
 * RSVP stays open through the end of this calendar day (local time).
 * Accepts ddmmyyyy or YYYY-MM-DD. Empty = never auto-closes.
 */
export function getRsvpCloseConfig(raw: string): RsvpCloseConfig {
  const parsed = parseCalendarDate(raw);
  if (!parsed) {
    return { deadline: null, label: '', isOpen: true };
  }

  const { day, month, year } = parsed;
  const deadline = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (isNaN(deadline.getTime())) {
    return { deadline: null, label: '', isOpen: true };
  }

  return {
    deadline,
    label: formatMediumDateEn(deadline),
    isOpen: Date.now() <= deadline.getTime(),
  };
}
