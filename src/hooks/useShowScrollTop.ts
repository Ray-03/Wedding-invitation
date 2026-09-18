import { useEffect, useState } from 'react';

/** Show a “back to top” affordance once the user scrolls past `threshold`. */
export function useShowScrollTop(enabled: boolean, threshold = 400) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setShow(false);
      return;
    }

    const handleScroll = () => {
      const isOver = window.scrollY > threshold;
      setShow((prev) => (prev !== isOver ? isOver : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, threshold]);

  return show;
}
