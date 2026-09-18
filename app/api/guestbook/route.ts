import { NextRequest, NextResponse } from 'next/server';
import { GUEST_RESPONSES_COLLECTION } from '@/lib/guest-map';
import { getAdminDb } from '@/lib/server/firebase-admin';
import {
  API_NO_STORE,
  assertAppCheck,
  assertSameOrigin,
  jsonError,
} from '@/lib/server/request-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 48;

function formatTimestamp(value: unknown): string {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return 'Just now';
}

export async function GET(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const appCheckError = await assertAppCheck(req);
  if (appCheckError) return appCheckError;

  const url = new URL(req.url);
  const limitRaw = Number(url.searchParams.get('limit') || DEFAULT_LIMIT);
  const pageSize = Number.isFinite(limitRaw)
    ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(limitRaw)))
    : DEFAULT_LIMIT;
  const after = url.searchParams.get('after');

  try {
    const db = getAdminDb();
    const col = db.collection(GUEST_RESPONSES_COLLECTION);
    let query = col.orderBy('timestamp', 'desc').limit(pageSize);

    if (after) {
      const cursorSnap = await col.doc(after).get();
      if (cursorSnap.exists) {
        query = col.orderBy('timestamp', 'desc').startAfter(cursorSnap).limit(pageSize);
      }
    }

    const [snap, countSnap] = await Promise.all([
      query.get(),
      col.count().get(),
    ]);

    const responses = snap.docs
      .map((d) => {
        const data = d.data() || {};
        const message = typeof data.message === 'string' ? data.message : '';
        if (!message.trim()) return null;
        return {
          id: d.id,
          name: typeof data.name === 'string' ? data.name : '',
          title: typeof data.title === 'string' ? data.title.trim() : undefined,
          message,
          timestamp: formatTimestamp(data.timestamp),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item != null);

    const last = snap.docs[snap.docs.length - 1];

    return NextResponse.json(
      {
        responses,
        cursor: last?.id ?? null,
        hasMore: snap.docs.length >= pageSize,
        totalCount: countSnap.data().count,
      },
      { headers: API_NO_STORE },
    );
  } catch (err) {
    console.error('[api/guestbook]', err);
    return jsonError(500, 'Could not load messages');
  }
}
