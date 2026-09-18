import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import {
  GUESTS_COLLECTION,
  GUEST_RESPONSES_COLLECTION,
  isValidRsvp,
  mapGuestDoc,
} from '@/lib/guest-map';
import { getAdminDb } from '@/lib/server/firebase-admin';
import {
  API_NO_STORE,
  assertAppCheck,
  assertInviteCreds,
  assertSameOrigin,
  jsonError,
} from '@/lib/server/request-guard';
import { normalizeGuestId, normalizeInviteKey } from '@/lib/invite-params';
import { getRsvpCloseConfig } from '@/lib/dateFormat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const appCheckError = await assertAppCheck(req);
  if (appCheckError) return appCheckError;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, 'Invalid request');
  }

  const guestId = normalizeGuestId(typeof body.guestId === 'string' ? body.guestId : null);
  const inviteKey = normalizeInviteKey(
    typeof body.inviteKey === 'string' ? body.inviteKey : null,
  );
  const publicName =
    typeof body.guestName === 'string' ? body.guestName.trim() : '';
  const wishText = typeof body.wishText === 'string' ? body.wishText.trim() : '';
  const rsvpStatus = body.rsvpStatus;
  const attendingCount = body.attendingCount;
  const isSignedGuest = Boolean(
    guestId && inviteKey && assertInviteCreds(guestId, inviteKey),
  );

  const rsvpClose = getRsvpCloseConfig(process.env.NEXT_PUBLIC_RSVP_CLOSE_DATE || '');
  if (!rsvpClose.isOpen) {
    return jsonError(403, 'RSVP is closed');
  }

  if (!wishText || wishText.length >= 2000) {
    return jsonError(400, 'Invalid message');
  }
  if (!isSignedGuest) {
    if (!publicName || publicName.length > 120) {
      return jsonError(400, 'Invalid name');
    }
  }
  if (!isValidRsvp(rsvpStatus)) {
    return jsonError(400, 'Invalid RSVP');
  }
  if (
    typeof attendingCount !== 'number' ||
    !Number.isInteger(attendingCount) ||
    (rsvpStatus === 'Attending' && attendingCount !== 1 && attendingCount !== 2) ||
    (rsvpStatus === 'Declined' && attendingCount !== 0)
  ) {
    return jsonError(400, 'Invalid attending count');
  }

  try {
    const db = getAdminDb();

    if (!isSignedGuest) {
      await db.collection(GUEST_RESPONSES_COLLECTION).add({
        name: publicName,
        message: wishText,
        rsvpStatus,
        attendingCount,
        timestamp: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true }, { headers: API_NO_STORE });
    }

    const guestRef = db.collection(GUESTS_COLLECTION).doc(guestId as string);
    const responseRef = db.collection(GUEST_RESPONSES_COLLECTION).doc(guestId as string);

    await db.runTransaction(async (tx) => {
      const guestSnap = await tx.get(guestRef);
      if (!guestSnap.exists) {
        throw Object.assign(new Error('not-found'), { code: 'not-found' });
      }

      const guest = mapGuestDoc(
        guestSnap.id,
        (guestSnap.data() || {}) as Record<string, unknown>,
      );
      if (!guest) {
        throw Object.assign(new Error('not-found'), { code: 'not-found' });
      }

      const existingWish =
        typeof guestSnap.get('wish') === 'string'
          ? String(guestSnap.get('wish')).trim()
          : '';
      if (existingWish) {
        throw Object.assign(new Error('already-submitted'), { code: 'already-submitted' });
      }

      const responseSnap = await tx.get(responseRef);
      if (responseSnap.exists) {
        throw Object.assign(new Error('already-submitted'), { code: 'already-submitted' });
      }

      tx.update(guestRef, {
        wish: wishText,
        rsvpStatus,
        attendingCount,
        wishSubmittedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const title = guest.title?.trim() || null;
      tx.set(responseRef, {
        guestId,
        name: guest.name,
        ...(title ? { title } : {}),
        message: wishText,
        timestamp: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ ok: true }, { headers: API_NO_STORE });
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
    if (code === 'not-found') return jsonError(404, 'Not found');
    if (code === 'already-submitted') return jsonError(409, 'Already submitted');
    console.error('[api/rsvp]', err);
    return jsonError(500, 'Could not save RSVP');
  }
}
