/**
 * Client-safe invite URL helpers (no HMAC secret).
 */

export function normalizeGuestId(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let id = String(raw).trim();
  if (!id) return null;

  try {
    id = decodeURIComponent(id);
  } catch {
    // keep as-is
  }

  id = id.trim();
  id = id.replace(/^[*_"'`<({\[]+/, '').replace(/[*_"'`>)}\],.;:!?\s]+$/g, '');
  const cleaned = id.replace(/[^A-Za-z0-9_-]/g, '');
  return cleaned || null;
}

/** HMAC token from ?k= (base64url). */
export function normalizeInviteKey(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let key = String(raw).trim();
  if (!key) return null;
  try {
    key = decodeURIComponent(key);
  } catch {
    // keep as-is
  }
  key = key.trim().replace(/^[*_"'`<({\[]+/, '').replace(/[*_"'`>)}\],.;:!?\s]+$/g, '');
  const cleaned = key.replace(/[^A-Za-z0-9_-]/g, '');
  return cleaned || null;
}

export function getGuestIdFromSearch(search: string): string | null {
  try {
    const params = new URLSearchParams(search);
    return normalizeGuestId(params.get('g') || params.get('guest'));
  } catch {
    return null;
  }
}

export function getInviteKeyFromSearch(search: string): string | null {
  try {
    const params = new URLSearchParams(search);
    return normalizeInviteKey(params.get('k') || params.get('key'));
  } catch {
    return null;
  }
}
