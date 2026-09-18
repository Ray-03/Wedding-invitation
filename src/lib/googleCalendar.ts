/**
 * Build Google Calendar "Add event" template URLs.
 * Times are local Asia/Jakarta (WIB) via ctz.
 */

export interface GoogleCalendarEventInput {
  title: string;
  /** YYYYMMDD */
  dateYmd: string;
  /** HH:mm */
  startTime: string;
  /** HH:mm — optional; defaults to +2 hours from start */
  endTime?: string;
  location?: string;
  details?: string;
}

function normalizeTime(time: string): string {
  const match = String(time || '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '090000';
  return `${match[1].padStart(2, '0')}${match[2]}00`;
}

function addHoursToTime(time: string, hours: number): string {
  const match = String(time || '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '110000';
  const total = parseInt(match[1], 10) * 60 + parseInt(match[2], 10) + hours * 60;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
}

export function buildGoogleCalendarUrl(input: GoogleCalendarEventInput): string {
  const start = `${input.dateYmd}T${normalizeTime(input.startTime)}`;
  const end = input.endTime
    ? `${input.dateYmd}T${normalizeTime(input.endTime)}`
    : `${input.dateYmd}T${addHoursToTime(input.startTime, 2)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${start}/${end}`,
    ctz: 'Asia/Jakarta',
  });

  if (input.location?.trim()) {
    params.set('location', input.location.trim());
  }
  if (input.details?.trim()) {
    params.set('details', input.details.trim());
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function openGoogleCalendar(input: GoogleCalendarEventInput) {
  window.open(buildGoogleCalendarUrl(input), '_blank', 'noopener,noreferrer');
}
