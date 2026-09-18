import type { RsvpStatus } from '../types/guest';
import { inviteFetch, resolveInviteCredsFromPage } from './guests';

/** Batch size per guestbook fetch (newest first). Load more to read older wishes. */
export const GUESTBOOK_PAGE_SIZE = 24;
/** @deprecated use GUESTBOOK_PAGE_SIZE — kept for existing imports */
export const GUESTBOOK_WALL_LIMIT = GUESTBOOK_PAGE_SIZE;

export interface GuestResponse {
  id: string;
  name: string;
  /** Honorific from guest doc when stored (e.g. Mr. & Mrs.) */
  title?: string;
  message: string;
  timestamp: string;
}

export interface WishFormValues {
  message: string;
  rsvpStatus: RsvpStatus | null;
  attendingCount: 1 | 2 | null;
}

export type WishFormErrors = {
  name?: string;
  message?: string;
  rsvp?: string;
  attendingCount?: string;
};

export function validateWishForm(
  values: WishFormValues & { name?: string; requireName?: boolean },
): WishFormErrors {
  const errors: WishFormErrors = {};
  if (values.requireName && !values.name?.trim()) errors.name = 'Name is required';
  if (!values.message.trim()) errors.message = 'Message is required';
  if (!values.rsvpStatus) errors.rsvp = 'RSVP is required';
  if (values.rsvpStatus === 'Attending' && !values.attendingCount) {
    errors.attendingCount = 'Select 1 or 2';
  }
  return errors;
}

export type GuestbookCursor = string | null;

export interface GuestbookPage {
  responses: GuestResponse[];
  cursor: GuestbookCursor;
  hasMore: boolean;
  totalCount: number;
}

function guestbookQuery(extra?: Record<string, string>): URLSearchParams {
  return new URLSearchParams({ ...extra });
}

/** One page of guestbook wishes. */
export async function fetchGuestbookPage(
  cursor: GuestbookCursor = null,
  pageSize = GUESTBOOK_PAGE_SIZE,
): Promise<GuestbookPage> {
  const extra: Record<string, string> = { limit: String(pageSize) };
  if (cursor) extra.after = cursor;
  const params = guestbookQuery(extra);

  const res = await inviteFetch(`/api/guestbook?${params}`);
  if (!res.ok) throw new Error('Failed to load guestbook');

  const data = (await res.json()) as GuestbookPage;
  return {
    responses: Array.isArray(data.responses) ? data.responses : [],
    cursor: data.cursor ?? null,
    hasMore: Boolean(data.hasMore),
    totalCount: typeof data.totalCount === 'number' ? data.totalCount : 0,
  };
}

export async function fetchGuestbookCount(): Promise<number> {
  const page = await fetchGuestbookPage(null, 1);
  return page.totalCount;
}

export interface SubmitWishInput {
  guestId?: string;
  guestName: string;
  guestTitle?: string;
  wishText: string;
  rsvpStatus: RsvpStatus;
  attendingCount: 1 | 2 | 0;
}

/** Persist wish + RSVP. Signed guest links still update the guest doc; general visitors post to the wall only. */
export async function submitWishAndRsvp(input: SubmitWishInput): Promise<void> {
  const creds = resolveInviteCredsFromPage();
  const inviteKey =
    input.guestId && creds?.id === input.guestId ? creds.key : creds?.key;

  const res = await inviteFetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guestId: input.guestId || undefined,
      inviteKey: inviteKey || undefined,
      guestName: input.guestName,
      wishText: input.wishText,
      rsvpStatus: input.rsvpStatus,
      attendingCount: input.attendingCount,
    }),
  });

  if (res.status === 409) {
    throw new Error('Already submitted');
  }
  if (!res.ok) {
    throw new Error('Failed to save RSVP');
  }
}

export function logFirestoreError(error: unknown, operation: string, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Firestore Error:', { message, operation, path });
}
