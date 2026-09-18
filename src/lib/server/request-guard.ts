import { NextResponse } from 'next/server';
import { verifyAppCheckToken } from './firebase-admin';
import { verifyInviteToken } from './invite-token';
import { normalizeGuestId, normalizeInviteKey } from '../invite-params';

export const API_NO_STORE = {
  'Cache-Control': 'no-store, max-age=0',
};

export function jsonError(status: number, message: string) {
  return NextResponse.json(
    { error: message },
    { status, headers: API_NO_STORE },
  );
}

function hostOf(urlLike: string | null): string | null {
  if (!urlLike) return null;
  try {
    return new URL(urlLike).host;
  } catch {
    return null;
  }
}

/**
 * Reject cross-site browser calls. GET from some browsers omits Origin
 * (and this app uses Referrer-Policy: no-referrer), so GET is allowed
 * without Origin; POST still requires a same-origin signal.
 */
export function assertSameOrigin(req: Request): NextResponse | null {
  if (process.env.INVITE_ORIGIN_CHECK === '0') return null;

  const host = req.headers.get('host');
  if (!host) return jsonError(403, 'Forbidden');

  const fetchSite = (req.headers.get('sec-fetch-site') || '').toLowerCase();
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return jsonError(403, 'Forbidden');
  }

  const originHost = hostOf(req.headers.get('origin'));
  if (originHost && originHost !== host) {
    return jsonError(403, 'Forbidden');
  }

  const method = req.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const sameOriginFetch = fetchSite === 'same-origin';
    if (!originHost && !sameOriginFetch) {
      return jsonError(403, 'Forbidden');
    }
  }

  return null;
}

export async function assertAppCheck(req: Request): Promise<NextResponse | null> {
  if (process.env.APP_CHECK_ENFORCE !== 'true') return null;

  const token = req.headers.get('X-Firebase-AppCheck');
  const ok = await verifyAppCheckToken(token);
  if (!ok) return jsonError(401, 'Forbidden');
  return null;
}

export function parseInviteQuery(req: Request): { id: string; key: string } | null {
  const url = new URL(req.url);
  const id = normalizeGuestId(url.searchParams.get('g') || url.searchParams.get('guest'));
  const key = normalizeInviteKey(url.searchParams.get('k') || url.searchParams.get('key'));
  if (!id || !key) return null;
  return { id, key };
}

/** Invalid token and unknown guest look the same so IDs cannot be probed. */
export function assertInviteCreds(id: string, key: string): boolean {
  return verifyInviteToken(id, key);
}
