import App from '@/App';
import { getGalleryImages } from '@/lib/getGalleryImages';

export default function Page() {
  const galleryImages = getGalleryImages();
  return <App galleryImages={galleryImages} />;
}
