
import { ThumbnailTemplate } from './types';

export const TEMPLATES: ThumbnailTemplate[] = [
  {
    id: '1',
    name: 'Gaming Battle',
    category: 'gaming',
    previewUrl: 'https://picsum.photos/seed/gaming1/1280/720',
    prompt: 'High energy cinematic gaming thumbnail, dramatic lighting, intense face of a gamer, vibrant colors, neon accents, 4k high detail'
  },
  {
    id: '2',
    name: 'Tech Review',
    category: 'tech',
    previewUrl: 'https://picsum.photos/seed/tech1/1280/720',
    prompt: 'Clean modern tech product review thumbnail, minimalist background, glowing gadgets, professional studio lighting, depth of field'
  },
  {
    id: '3',
    name: 'Lifestyle Vlog',
    category: 'vlog',
    previewUrl: 'https://picsum.photos/seed/vlog1/1280/720',
    prompt: 'Aesthetic travel vlog thumbnail, warm sun-kissed lighting, beautiful scenery, expressive happy person, lifestyle photography style'
  },
  {
    id: '4',
    name: 'Educational Tutorial',
    category: 'education',
    previewUrl: 'https://picsum.photos/seed/edu1/1280/720',
    prompt: 'Professional educational thumbnail, chalkboard background with digital icons, clear subject, bold typography space, high contrast'
  }
];

export interface PlanFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  creditsMonthly: number;
  creditsAnnual: number;
  thumbnailsMonthly: number;
  thumbnailsAnnual: number;
  features: PlanFeature[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'creator-monthly',
    name: 'Creator Monthly',
    priceMonthly: 25,
    priceAnnual: 25,
    creditsMonthly: 50,
    creditsAnnual: 50,
    thumbnailsMonthly: 50,
    thumbnailsAnnual: 50,
    popular: true,
    features: [
      { name: 'Prompt-to-Thumbnail Generation', included: true },
      { name: 'Reference Image Mode', included: true },
      { name: 'Video Snapshot Mode', included: true },
      { name: '16:9 & 9:16 Aspect Ratios', included: true },
      { name: 'Overlay Text', included: true },
      { name: 'Quick Theme Presets (8 themes)', included: true },
      { name: 'Style & Lighting Controls', included: true },
      { name: 'Gallery & History', included: true },
      { name: 'Selective Region Editing', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Early Access to New Features', included: true }
    ]
  },
  {
    id: 'creator-yearly',
    name: 'Creator Yearly',
    priceMonthly: 20.83,
    priceAnnual: 20.83,
    creditsMonthly: 600,
    creditsAnnual: 600,
    thumbnailsMonthly: 600,
    thumbnailsAnnual: 600,
    popular: false,
    features: [
      { name: 'Prompt-to-Thumbnail Generation', included: true },
      { name: 'Reference Image Mode', included: true },
      { name: 'Video Snapshot Mode', included: true },
      { name: '16:9 & 9:16 Aspect Ratios', included: true },
      { name: 'Overlay Text', included: true },
      { name: 'Quick Theme Presets (8 themes)', included: true },
      { name: 'Style & Lighting Controls', included: true },
      { name: 'Gallery & History', included: true },
      { name: 'Selective Region Editing', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Early Access to New Features', included: true }
    ]
  }
];

export const UPCOMING_TOOLS = [
  { name: 'AI Face Swap', status: 'Coming Q4' },
  { name: 'Motion Overlays', status: 'In Alpha' },
  { name: 'Batch Generation', status: 'Planning' }
];

export interface Theme {
  id: string;
  name: string;
  icon: string;
  style: string;
  lighting: string;
  emphasis: string;
  promptAddition?: string;
}

// Showcase Images for Landing Page
export const SHOWCASE_IMAGES = [
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/Generated%20Image%20December%2024,%202025%20-%201_12AM.jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/Generated%20Image%20December%2024,%202025%20-%201_12AM%20(1).jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/Generated%20Image%20December%2024,%202025%20-%201_11AM%20(1).jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarthumbnail3.jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnaile%20December%2030,%202025%20-%2010_43AM.jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnaile%20December%2030,%202025%20-%2010_42AM%20(3).jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnaile%20December%2030,%202025%20-%2010_42AM%20(1).jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnaile%20December%2030,%202025%20-%2010_40AM.jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnail1%20January%2007,%202026%20-%2010_06AM%20(4).jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnail1%20January%2007,%202026%20-%2010_06AM%20(3).jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnail1%20January%2007,%202026%20-%2010_06AM%20(2).jpeg',
  'https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/internal/czarnewthumbnail1%20January%2007,%202026%20-%2010_05AM.jpeg'
];

export const THEMES: Theme[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    style: 'Cinematic',
    lighting: 'Dramatic',
    emphasis: 'High Contrast',
    promptAddition: 'cinematic composition, film-like quality, dramatic depth'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    icon: '🌈',
    style: 'Vibrant',
    lighting: 'Bright',
    emphasis: 'Colorful',
    promptAddition: 'vibrant colors, energetic atmosphere, eye-catching palette'
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌙',
    style: 'Dark',
    lighting: 'Moody',
    emphasis: 'Shadow Play',
    promptAddition: 'dark atmosphere, moody shadows, mysterious lighting'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '✨',
    style: 'Minimalist',
    lighting: 'Soft',
    emphasis: 'Clean',
    promptAddition: 'minimalist design, clean composition, simple elegance'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: '🎮',
    style: 'Gaming',
    lighting: 'Neon',
    emphasis: 'High Energy',
    promptAddition: 'gaming aesthetic, neon accents, high energy, dynamic'
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: '💼',
    style: 'Professional',
    lighting: 'Studio',
    emphasis: 'Polished',
    promptAddition: 'professional quality, studio lighting, polished finish'
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: '☀️',
    style: 'Warm',
    lighting: 'Golden Hour',
    emphasis: 'Cozy',
    promptAddition: 'warm tones, golden hour lighting, cozy atmosphere'
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    icon: '🚀',
    style: 'Futuristic',
    lighting: 'Holographic',
    emphasis: 'Tech',
    promptAddition: 'futuristic design, holographic effects, sci-fi aesthetic'
  }
];
