import { useEffect } from 'react';

/**
 * Preloads a list of images. Dependency is keyed by URL join so inline arrays
 * do not retrigger the effect every render.
 */
export function useImagePreloader(imageUrls: readonly string[]) {
  const urlsKey = imageUrls.join('\0');

  useEffect(() => {
    if (!urlsKey) return;

    const urls = urlsKey.split('\0');
    const images = urls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });

    return () => {
      images.forEach((img) => {
        img.src = '';
      });
    };
  }, [urlsKey]);
}
