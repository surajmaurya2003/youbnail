import { supabase } from '../lib/supabase';
import { UserProfile, GeneratedThumbnail, UsageRecord, PlanTier } from '../types';

// Database table types
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  credits: number;
  plan: PlanTier;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseThumbnail {
  id: string;
  user_id: string;
  storage_path: string;
  public_url: string;
  prompt: string;
  aspect_ratio: string;
  created_at: string;
}

export interface DatabaseUsageRecord {
  id: string;
  user_id: string;
  type: 'generation' | 'edit';
  mode: string;
  aspect_ratio: string;
  credits: number;
  prompt?: string;
  created_at: string;
}

// Auth Service
export const authService = {
  async signInWithGoogle() {
    // Use environment variable if available, otherwise use current origin
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${appUrl}/`,
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async signInWithMagicLink(email: string) {
    // Use environment variable if available, otherwise use current origin
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${appUrl}/`,
      },
    });

    if (error) throw error;
    return data;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getUserProviders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Get user's identity providers from user.identities
    // This is available in the user object from getSession or getUser
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.identities) return [];
    
    return session.user.identities;
  },

  async isGoogleLinked() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check if user has Google identity
      // User identities are available in app_metadata or we can check the provider
      const provider = user.app_metadata?.provider || user.user_metadata?.provider;
      const identities = user.identities || [];
      
      // Check if any identity is Google
      const hasGoogle = identities.some((identity: any) => identity.provider === 'google');
      
      // Also check if the main provider is Google
      return hasGoogle || provider === 'google';
    } catch (error) {
      console.error('Authentication check failed');
      return false;
    }
  },

  async unlinkGoogle() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // Check if Google is actually linked
    const isLinked = await this.isGoogleLinked();
    if (!isLinked) {
      throw new Error('Google account is not linked');
    }

    // Check if user has email/password authentication  
    // Since we only use magic link and social login, we need to ensure user has email access
    const hasEmailAccess = user.email;
    
    if (!hasEmailAccess) {
      throw new Error('Cannot unlink Google account without email access for magic link authentication.');
    }

    // Note: Supabase client doesn't support unlinking providers directly
    // This requires admin API access. For now, we'll provide guidance
    // In production, you'd need a backend endpoint to handle this
    throw new Error('To unlink Google, please contact support or ensure you have a password set. You can then sign in with email/password instead of Google.');
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

// User Profile Service
export const userService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If user doesn't exist, return null (don't log as error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Profile fetch failed');
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      credits: data.credits,
      plan: data.plan,
      avatar: data.avatar_url,
      // Include subscription fields
      subscription_id: data.subscription_id || null,
      subscription_status: data.subscription_status || null,
      subscription_product_id: data.subscription_product_id || null,
      subscription_billing_period: data.subscription_billing_period || null,
      subscription_started_at: data.subscription_started_at || null,
      subscription_ends_at: data.subscription_ends_at || null,
      payment_customer_id: data.payment_customer_id || null,
    };
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile> & { id?: string; email?: string }) {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.credits !== undefined) updateData.credits = updates.credits;
    if (updates.plan !== undefined) updateData.plan = updates.plan;
    if (updates.avatar !== undefined) updateData.avatar_url = updates.avatar;

    // Check if user exists
    const existing = await this.getUserProfile(userId);
    
    if (!existing) {
      // Create new user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: updates.email || '',
          name: updates.name || 'User',
          credits: updates.credits ?? 10,
          plan: updates.plan || 'starter',
          avatar_url: updates.avatar,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Update existing profile
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async updateCredits(userId: string, newCredits: number) {
    const { data, error } = await supabase
      .from('users')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Storage Service
export const storageService = {
  async uploadThumbnail(userId: string, file: File, filename?: string): Promise<{ url: string; path: string }> {
    const fileExt = file.name.split('.').pop() || filename?.split('.').pop() || 'png';
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('thumbnails')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, path: filePath };
  },

  async deleteThumbnail(storagePath: string) {
    const { error } = await supabase.storage
      .from('thumbnails')
      .remove([storagePath]);

    if (error) throw error;
  },

  getThumbnailUrl(storagePath: string): string {
    const { data } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(storagePath);

    return data.publicUrl;
  },
};

// Thumbnails Service
export const thumbnailsService = {
  async saveThumbnail(
    userId: string,
    thumbnail: Omit<GeneratedThumbnail, 'id' | 'timestamp'>,
    storagePath: string,
    aspectRatio: string
  ): Promise<GeneratedThumbnail> {
    const { data, error } = await supabase
      .from('thumbnails')
      .insert({
        user_id: userId,
        storage_path: storagePath,
        public_url: thumbnail.url,
        prompt: thumbnail.prompt,
        aspect_ratio: aspectRatio,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      url: data.public_url,
      prompt: data.prompt,
      timestamp: new Date(data.created_at).getTime(),
    };
  },

  async getUserThumbnails(userId: string): Promise<GeneratedThumbnail[]> {
    const { data, error } = await supabase
      .from('thumbnails')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Thumbnails fetch failed');
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      url: item.public_url,
      prompt: item.prompt,
      timestamp: new Date(item.created_at).getTime(),
    }));
  },

  async deleteThumbnail(thumbnailId: string, storagePath: string) {
    // Delete from storage
    await storageService.deleteThumbnail(storagePath);

    // Delete from database
    const { error } = await supabase
      .from('thumbnails')
      .delete()
      .eq('id', thumbnailId);

    if (error) throw error;
  },
};

// Usage Records Service
export const usageService = {
  async saveUsageRecord(userId: string, record: Omit<UsageRecord, 'id' | 'timestamp'>): Promise<UsageRecord> {
    const { data, error } = await supabase
      .from('usage_records')
      .insert({
        user_id: userId,
        type: record.type,
        mode: record.mode,
        aspect_ratio: record.aspectRatio,
        credits: record.credits,
        prompt: record.prompt,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      timestamp: new Date(data.created_at).getTime(),
      type: data.type,
      mode: data.mode as any,
      aspectRatio: data.aspect_ratio as any,
      credits: data.credits,
      prompt: data.prompt,
    };
  },

  async getUserUsageRecords(userId: string): Promise<UsageRecord[]> {
    const { data, error } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Usage records fetch failed');
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      timestamp: new Date(item.created_at).getTime(),
      type: item.type,
      mode: item.mode as any,
      aspectRatio: item.aspect_ratio as any,
      credits: item.credits,
      prompt: item.prompt,
    }));
  },
};
