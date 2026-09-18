import { useEffect } from 'react';

/** Lock body scroll while `locked` is true (e.g. cover closed). */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.style.overflow = locked ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [locked]);
}
