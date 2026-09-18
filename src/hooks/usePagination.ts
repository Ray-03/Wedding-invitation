import { useEffect, useMemo, useState } from 'react';

function buildPageNumbers(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  if (page <= 2) {
    pages.add(2);
    pages.add(3);
  } else if (page >= totalPages - 1) {
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  } else {
    pages.add(page);
    if (page > 2) pages.add(page - 1);
    if (page < totalPages - 1) pages.add(page + 1);
  }

  return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
}

export function usePagination(
  loadedCount: number,
  pageSize: number,
  /** When set (e.g. full guestbook count), pagination spans all items; pages load on demand. */
  totalItemCount?: number,
) {
  const [page, setPage] = useState(1);
  const safeSize = Math.max(1, pageSize);
  const countForPages =
    typeof totalItemCount === 'number' && totalItemCount >= 0
      ? totalItemCount
      : loadedCount;
  const totalPages = countForPages <= 0 ? 1 : Math.ceil(countForPages / safeSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    else if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(page, totalPages),
    [page, totalPages],
  );

  const slice = <T,>(items: T[]) => {
    const start = (page - 1) * safeSize;
    return items.slice(start, start + safeSize);
  };

  return { page, setPage, totalPages, pageNumbers, pageSize: safeSize, slice };
}
