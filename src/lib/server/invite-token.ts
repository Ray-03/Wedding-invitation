import { createHmac, timingSafeEqual } from 'crypto';

function getSecret(): string {
  const secret = String(process.env.INVITE_HMAC_SECRET || '').trim();
  if (!secret) {
    throw new Error('INVITE_HMAC_SECRET is not set');
  }
  return secret;
}

export function signGuestId(guestId: string): string {
  return createHmac('sha256', getSecret()).update(guestId).digest('base64url');
}

export function verifyInviteToken(guestId: string, token: string | null | undefined): boolean {
  if (!guestId || !token) return false;
  try {
    const expected = Buffer.from(signGuestId(guestId));
    const actual = Buffer.from(String(token));
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
