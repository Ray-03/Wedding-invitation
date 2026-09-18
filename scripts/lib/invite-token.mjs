import { createHmac, timingSafeEqual } from 'crypto';

function getSecret() {
  const secret = String(process.env.INVITE_HMAC_SECRET || '').trim();
  if (!secret) {
    throw new Error(
      'INVITE_HMAC_SECRET is not set. Add a long random value to .env (e.g. openssl rand -hex 32).'
    );
  }
  return secret;
}

export function signGuestId(guestId) {
  return createHmac('sha256', getSecret()).update(String(guestId)).digest('base64url');
}

export function buildInviteUrl(siteUrl, guestId) {
  const base = String(siteUrl || '').replace(/\/$/, '');
  const k = signGuestId(guestId);
  return `${base}/?g=${encodeURIComponent(guestId)}&k=${encodeURIComponent(k)}`;
}
