import { DEFAULT_GUEST, type Guest } from '../types/guest';
import { mapGuestDoc } from './guest-map';
import { getAppCheckHeaders } from './firebase';
import {
  getGuestIdFromSearch,
  getInviteKeyFromSearch,
  normalizeGuestId,
  normalizeInviteKey,
} from './invite-params';

export const GUESTS_COLLECTION = 'guests';
export const GUEST_RESPONSES_COLLECTION = 'guest_responses';
export const GUEST_CREDS_STORAGE_KEY = 'wedding_invite_creds';
/** @deprecated old key — cleared so a stored id cannot reopen an invite */
export const GUEST_ID_STORAGE_KEY = 'wedding_guest_id';

export interface InviteCreds {
  id: string;
  key: string;
}

export function getInviteCredsFromSearch(search: string): InviteCreds | null {
  const id = getGuestIdFromSearch(search);
  const key = getInviteKeyFromSearch(search);
  if (!id || !key) return null;
  return { id, key };
}

function clearLegacyGuestId() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_ID_STORAGE_KEY);
    sessionStorage.removeItem(GUEST_ID_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function readStoredInviteCreds(): InviteCreds | null {
  if (typeof window === 'undefined') return null;
  clearLegacyGuestId();
  try {
    const raw = sessionStorage.getItem(GUEST_CREDS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown; key?: unknown };
    const id = normalizeGuestId(typeof parsed.id === 'string' ? parsed.id : null);
    const key = normalizeInviteKey(typeof parsed.key === 'string' ? parsed.key : null);
    if (!id || !key) return null;
    return { id, key };
  } catch {
    return null;
  }
}

export function storeInviteCreds(creds: InviteCreds) {
  const id = normalizeGuestId(creds.id);
  const key = normalizeInviteKey(creds.key);
  if (!id || !key || typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(GUEST_CREDS_STORAGE_KEY, JSON.stringify({ id, key }));
  } catch {
    // private mode / quota — ignore
  }
}

/** Keep ?g= and ?k= in the address bar so refresh / share keep working. */
export function ensureInviteCredsInUrl(creds: InviteCreds) {
  const id = normalizeGuestId(creds.id);
  const key = normalizeInviteKey(creds.key);
  if (!id || !key || typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('g') === id && url.searchParams.get('k') === key) return;
    url.searchParams.set('g', id);
    url.searchParams.set('k', key);
    url.searchParams.delete('guest');
    url.searchParams.delete('key');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // ignore
  }
}

export function resolveInviteCredsFromPage(): InviteCreds | null {
  if (typeof window === 'undefined') return null;
  return getInviteCredsFromSearch(window.location.search) || readStoredInviteCreds();
}

async function inviteFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = {
    Accept: 'application/json',
    ...(init?.headers || {}),
    ...(await getAppCheckHeaders()),
  };
  return fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers,
  });
}

export async function fetchGuestById(
  guestId: string,
  inviteKey: string,
): Promise<Guest | null> {
  const id = normalizeGuestId(guestId);
  const key = normalizeInviteKey(inviteKey);
  if (!id || !key) return null;

  const params = new URLSearchParams({ g: id, k: key });
  const res = await inviteFetch(`/api/guest?${params}`);
  if (res.status === 404 || res.status === 401 || res.status === 403 || res.status === 400) {
    return null;
  }
  if (!res.ok) throw new Error('Failed to load guest');

  const data = (await res.json()) as Record<string, unknown>;
  return mapGuestDoc(id, { ...data, name: data.name, inviteType: data.inviteType });
}

export async function fetchGuestByIdWithRetry(
  guestId: string,
  inviteKey: string,
  attempts = 3,
): Promise<Guest | null> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchGuestById(guestId, inviteKey);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to load guest');
}

export { DEFAULT_GUEST, getGuestIdFromSearch, getInviteKeyFromSearch, normalizeGuestId };
export { inviteFetch };
