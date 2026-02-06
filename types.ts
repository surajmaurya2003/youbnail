
export type PlanTier = 'free' | 'starter' | 'creator-monthly' | 'creator-yearly';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  plan: PlanTier;
  avatar?: string;
  // Subscription fields
  subscription_id?: string | null;
  subscription_status?: string | null;
  subscription_product_id?: string | null;
  subscription_billing_period?: string | null;
  subscription_started_at?: string | null;
  subscription_ends_at?: string | null;
  payment_customer_id?: string | null;
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  previewUrl: string;
  prompt: string;
  category: 'gaming' | 'vlog' | 'tech' | 'education';
}

export interface GeneratedThumbnail {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  storage_path?: string;
}

export enum CreationMode {
  PROMPT = 'prompt',
  REFERENCE = 'reference',
  VIDEO = 'video'
}

export type AspectRatio = '16:9' | '9:16';

export interface GenerationOptions {
  overlayText?: string;
  style?: string;
  lighting?: string;
  emphasis?: string;
  aspectRatio?: AspectRatio;
}

export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UsageRecord {
  id: string;
  timestamp: number;
  type: 'generation' | 'edit';
  mode: CreationMode;
  aspectRatio: AspectRatio;
  credits: number;
  prompt?: string;
}
