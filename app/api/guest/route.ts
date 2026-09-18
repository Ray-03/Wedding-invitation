import { NextRequest, NextResponse } from 'next/server';
import { GUESTS_COLLECTION, mapGuestDoc } from '@/lib/guest-map';
import { getAdminDb } from '@/lib/server/firebase-admin';
import {
  API_NO_STORE,
  assertAppCheck,
  assertInviteCreds,
  assertSameOrigin,
  jsonError,
  parseInviteQuery,
} from '@/lib/server/request-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const appCheckError = await assertAppCheck(req);
  if (appCheckError) return appCheckError;

  const creds = parseInviteQuery(req);
  if (!creds || !assertInviteCreds(creds.id, creds.key)) {
    return jsonError(404, 'Not found');
  }

  try {
    const snap = await getAdminDb().collection(GUESTS_COLLECTION).doc(creds.id).get();
    if (!snap.exists) return jsonError(404, 'Not found');

    const guest = mapGuestDoc(snap.id, (snap.data() || {}) as Record<string, unknown>);
    if (!guest) return jsonError(404, 'Not found');

    return NextResponse.json(guest, { headers: API_NO_STORE });
  } catch (err) {
    console.error('[api/guest]', err);
    return jsonError(500, 'Could not load invitation');
  }
}
