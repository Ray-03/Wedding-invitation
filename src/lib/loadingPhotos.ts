import type { GalleryImage } from './getGalleryImages';

/**
 * Small set of photos for the invitation loading flipbook.
 * Keep this short and light — preloading the full gallery on iPhone
 * stalls Safari (multi-MB decode before first paint).
 */
const LOADER_PHOTOS = [
  '/images/story/story1.webp',
  '/images/story/story2.webp',
  '/images/story/story3.webp',
] as const;

/**
 * Photos for the invitation loading flipbook.
 * Gallery images are intentionally excluded — they load lazily after open.
 */
export function getLoadingPhotos(_galleryImages: GalleryImage[]): string[] {
  return [...LOADER_PHOTOS];
}
