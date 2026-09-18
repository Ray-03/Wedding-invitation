import type { ComponentType } from 'react';
import Quotes from '../components/Quotes';
import Profiles from '../components/Profiles';
import Story from '../components/Story';
import Gallery from '../components/Gallery';
import Countdown from '../components/Countdown';
import Details from '../components/Details';
import DressCode from '../components/DressCode';
import Gifts from '../components/Gifts';
import Wishes from '../components/Wishes';
import { WEDDING_CONFIG } from '../config';
import type { GalleryImage } from './getGalleryImages';

export interface InvitationVisibility {
  showStory: boolean;
}

export interface InvitationSectionDef {
  id: string;
  label: string;
  visible: (ctx: InvitationVisibility) => boolean;
  /** When set, section receives gallery images as a prop */
  needsGallery?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
}

/** Single source of truth for invitation sections + nav menu (OCP). */
export const INVITATION_SECTIONS: InvitationSectionDef[] = [
  {
    id: 'quotes',
    label: 'Quotes',
    visible: () => !!WEDDING_CONFIG.storyQuote,
    component: Quotes,
  },
  {
    id: 'profiles',
    label: 'The Couple',
    visible: () => true,
    component: Profiles,
  },
  {
    id: 'story',
    label: 'Love Story',
    visible: (ctx) => ctx.showStory,
    component: Story,
  },
  {
    id: 'gallery',
    label: 'Gallery',
    visible: () => true,
    needsGallery: true,
    component: Gallery,
  },
  {
    id: 'countdown',
    label: 'Countdown',
    visible: () => true,
    component: Countdown,
  },
  {
    id: 'details',
    label: 'Event Details',
    visible: () => true,
    component: Details,
  },
  {
    id: 'dresscode',
    label: 'Dress Code',
    visible: (ctx) => ctx.showStory,
    component: DressCode,
  },
  {
    id: 'gifts',
    label: 'Wedding Gift',
    visible: () => WEDDING_CONFIG.giftAccounts.length > 0,
    component: Gifts,
  },
  {
    id: 'wishes',
    label: 'Wishes & Prayers',
    visible: () => true,
    component: Wishes,
  },
];

export function getVisibleSections(ctx: InvitationVisibility) {
  return INVITATION_SECTIONS.filter((s) => s.visible(ctx));
}

export function getMenuItems(ctx: InvitationVisibility) {
  return getVisibleSections(ctx).map((item, index) => ({
    id: item.id,
    label: item.label,
    number: String(index + 1).padStart(2, '0'),
  }));
}

export function renderInvitationSection(
  section: InvitationSectionDef,
  galleryImages: GalleryImage[]
) {
  if (section.needsGallery) {
    const GallerySection = section.component as ComponentType<{ images: GalleryImage[] }>;
    return <GallerySection images={galleryImages} />;
  }
  const Section = section.component;
  return <Section />;
}
