import type { Guest, InviteType, RsvpStatus } from '../types/guest';

export const GUESTS_COLLECTION = 'guests';
export const GUEST_RESPONSES_COLLECTION = 'guest_responses';

export function parseInviteType(value: unknown): InviteType {
  if (value === 'physical') return 'physical';
  if (value === 'both') return 'both';
  if (value === 'special') return 'special';
  return 'livestream';
}

export function parseRsvp(value: unknown): RsvpStatus | undefined {
  if (value === 'Attending' || value === 'Declined') return value;
  return undefined;
}

export function parseAttendingCount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function isValidRsvp(value: unknown): value is RsvpStatus {
  return value === 'Attending' || value === 'Declined';
}

export function mapGuestDoc(id: string, data: Record<string, unknown>): Guest | null {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) return null;

  const inviteType = parseInviteType(data.inviteType);

  return {
    id,
    name,
    title: typeof data.title === 'string' ? data.title.trim() : undefined,
    inviteType,
    showStory: inviteType !== 'physical',
    wish: typeof data.wish === 'string' ? data.wish : undefined,
    rsvpStatus: parseRsvp(data.rsvpStatus),
    attendingCount: parseAttendingCount(data.attendingCount),
    rsvpCloseDate:
      typeof data.rsvpCloseDate === 'string' && data.rsvpCloseDate.trim()
        ? data.rsvpCloseDate.trim()
        : undefined,
  };
}
