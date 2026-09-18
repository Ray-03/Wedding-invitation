import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import { imageSize } from 'image-size';

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
  placeholderGradient: string;
}

const PLACEHOLDER_GRADIENTS = [
  'from-amber-200/30 via-sky-200/20 to-amber-100/30',
  'from-cyan-200/30 via-amber-200/20 to-blue-200/30',
  'from-stone-200/30 via-amber-100/20 to-stone-100/30',
  'from-emerald-100/20 via-sky-200/20 to-stone-100/30',
  'from-slate-200/30 via-orange-100/20 to-slate-100/30',
  'from-stone-300/30 via-amber-200/20 to-stone-200/30',
  'from-amber-100/30 via-rose-100/20 to-stone-100/30',
  'from-blue-100/20 via-sky-100/20 to-amber-50/30',
  'from-rose-200/20 via-orange-100/20 to-stone-100/30',
  'from-cyan-100/20 via-sky-200/20 to-stone-100/30',
];

/**
 * Reads every image currently in `public/images/gallery`.
 * Call from a Server Component only (uses Node `fs`).
 * Cached per request via React `cache`.
 */
export const getGalleryImages = cache(function getGalleryImages(): GalleryImage[] {
  const galleryDir = path.join(process.cwd(), 'public', 'images', 'gallery');

  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  const files = fs
    .readdirSync(galleryDir)
    .filter((file) => /\.(webp|jpe?g|png)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return files.map((fileName, idx) => {
    const filePath = path.join(galleryDir, fileName);
    let width = 1200;
    let height = 1800;

    try {
      const dims = imageSize(fs.readFileSync(filePath));
      if (dims.width) width = dims.width;
      if (dims.height) height = dims.height;
    } catch {
      // Keep defaults if dimensions cannot be read
    }

    return {
      id: idx,
      src: `/images/gallery/${fileName}`,
      alt: `Gallery Photo ${idx + 1}`,
      width,
      height,
      placeholderGradient: PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length],
    };
  });
});
