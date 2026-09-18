'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_GUEST, formatGuestGreeting, guestVisibility, type Guest } from '../types/guest';
import {
  ensureInviteCredsInUrl,
  fetchGuestByIdWithRetry,
  getGuestIdFromSearch,
  readStoredInviteCreds,
  resolveInviteCredsFromPage,
  storeInviteCreds,
  type InviteCreds,
} from '../lib/guests';

interface GuestContextValue {
  guest: Guest;
  greeting: string;
  loading: boolean;
  notFound: boolean;
  /** True when a network error prevented loading (after retries) */
  loadError: boolean;
  /** True when URL/session includes a guest id (even if the token is wrong) */
  hasGuestParam: boolean;
  /** True when a valid signed guest document was loaded */
  isRegistered: boolean;
  visibility: ReturnType<typeof guestVisibility>;
  refreshGuest: () => Promise<void>;
  patchGuest: (partial: Partial<Guest>) => void;
}

const GuestContext = createContext<GuestContextValue | null>(null);

function resolvePartialGuestId(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    getGuestIdFromSearch(window.location.search) ||
    readStoredInviteCreds()?.id ||
    null
  );
}

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guest, setGuest] = useState<Guest>(DEFAULT_GUEST);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [creds, setCreds] = useState<InviteCreds | null>(null);
  const [hasGuestParam, setHasGuestParam] = useState(false);

  const load = useCallback(async (next: InviteCreds | null, sawGuestId: boolean) => {
    setHasGuestParam(sawGuestId);
    if (!next) {
      setGuest(DEFAULT_GUEST);
      setNotFound(sawGuestId);
      setLoadError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(false);
    try {
      const result = await fetchGuestByIdWithRetry(next.id, next.key);
      if (result) {
        setGuest(result);
        setNotFound(false);
        setLoadError(false);
        storeInviteCreds(next);
        ensureInviteCredsInUrl(next);
      } else {
        setGuest(DEFAULT_GUEST);
        setNotFound(true);
        setLoadError(false);
      }
    } catch (err) {
      console.error('[guest] Failed to load guest', err);
      setGuest(DEFAULT_GUEST);
      setNotFound(false);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const next = resolveInviteCredsFromPage();
    setCreds(next);
    void load(next, Boolean(resolvePartialGuestId()));
  }, [load]);

  const refreshGuest = useCallback(async () => {
    const next = creds || resolveInviteCredsFromPage();
    if (next && (!creds || next.id !== creds.id || next.key !== creds.key)) {
      setCreds(next);
    }
    await load(next, Boolean(next || resolvePartialGuestId()));
  }, [load, creds]);

  const patchGuest = useCallback((partial: Partial<Guest>) => {
    setGuest((prev) => ({ ...prev, ...partial }));
  }, []);

  const isRegistered = Boolean(guest.id);

  const value = useMemo<GuestContextValue>(
    () => ({
      guest,
      greeting: formatGuestGreeting(guest),
      loading,
      notFound,
      loadError,
      hasGuestParam,
      isRegistered,
      visibility: guestVisibility(guest),
      refreshGuest,
      patchGuest,
    }),
    [guest, loading, notFound, loadError, hasGuestParam, isRegistered, refreshGuest, patchGuest]
  );

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) {
    throw new Error('useGuest must be used within GuestProvider');
  }
  return ctx;
}
