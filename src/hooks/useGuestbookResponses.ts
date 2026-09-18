import { useCallback, useEffect, useRef, useState } from 'react';
import { GUEST_RESPONSES_COLLECTION } from '../lib/guests';
import {
  fetchGuestbookPage,
  logFirestoreError,
  type GuestbookCursor,
  type GuestResponse,
} from '../lib/wishes';

export function useGuestbookResponses() {
  const [responses, setResponses] = useState<GuestResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorRef = useRef<GuestbookCursor>(null);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const responsesRef = useRef<GuestResponse[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    hasMoreRef.current = true;
    try {
      const page = await fetchGuestbookPage(null);
      cursorRef.current = page.cursor;
      hasMoreRef.current = page.hasMore;
      responsesRef.current = page.responses;
      setResponses(page.responses);
      setHasMore(page.hasMore);
      setTotalCount(page.totalCount);
    } catch (error) {
      logFirestoreError(error, 'get', GUEST_RESPONSES_COLLECTION);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (): Promise<number> => {
    if (!hasMoreRef.current || loadingMoreRef.current) {
      return responsesRef.current.length;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await fetchGuestbookPage(cursorRef.current);
      cursorRef.current = page.cursor;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);

      const seen = new Set(responsesRef.current.map((r) => r.id));
      const appended = page.responses.filter((r) => !seen.has(r.id));
      const next = [...responsesRef.current, ...appended];
      responsesRef.current = next;
      setResponses(next);
      return next.length;
    } catch (error) {
      logFirestoreError(error, 'get', GUEST_RESPONSES_COLLECTION);
      return responsesRef.current.length;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  /** Fetch batches until at least `needed` items are loaded (or no more). */
  const ensureLoaded = useCallback(async (needed: number) => {
    let loaded = responsesRef.current.length;
    while (loaded < needed && hasMoreRef.current) {
      const prev = loaded;
      loaded = await loadMore();
      if (loaded <= prev) break;
    }
  }, [loadMore]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    responses,
    totalCount,
    hasMore,
    loading,
    loadingMore,
    refresh,
    loadMore,
    ensureLoaded,
  };
}
