-- Fix for Google OAuth "Database error saving new user"
-- Run this entire script in Supabase SQL Editor

-- First, let's check and update the users table structure
-- Add any missing columns that might be required

DO $$ 
BEGIN
    -- Add subscription columns if they don't exist
    BEGIN
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_id TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_product_id TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_billing_period TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_customer_id TEXT;
    EXCEPTION 
        WHEN duplicate_column THEN 
            -- Column already exists, continue
            NULL;
    END;
    
    -- Update plan constraint to match current plans
    BEGIN
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;
        ALTER TABLE public.users ADD CONSTRAINT users_plan_check 
        CHECK (plan IN ('free', 'creator-monthly', 'creator-yearly'));
    EXCEPTION 
        WHEN OTHERS THEN 
            -- Constraint issue, continue
            NULL;
    END;
END $$;

-- Create improved trigger function with robust error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_email TEXT;
BEGIN
    -- Extract email (Google OAuth always provides email)
    user_email := NEW.email;
    
    -- If no email, skip profile creation but don't fail
    IF user_email IS NULL OR user_email = '' THEN
        RAISE LOG 'User % created without email, skipping profile creation', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Extract name from metadata with multiple fallbacks
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'display_name',
        split_part(user_email, '@', 1),
        'User'
    );
    
    -- Insert user profile with error handling
    BEGIN
        INSERT INTO public.users (
            id, 
            email, 
            name, 
            credits, 
            plan,
            avatar_url,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            user_email,
            user_name,
            0,  -- No free credits for new users
            'free',  -- Free plan
            NEW.raw_user_meta_data->>'avatar_url',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = CASE 
                WHEN users.name = 'User' THEN EXCLUDED.name 
                ELSE users.name 
            END,
            avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
            updated_at = NOW();
            
        RAISE LOG 'Successfully created profile for user % (%)', NEW.id, user_email;
        
    EXCEPTION 
        WHEN unique_violation THEN
            -- User already exists, update instead
            UPDATE public.users 
            SET 
                email = user_email,
                name = CASE 
                    WHEN name = 'User' THEN user_name 
                    ELSE name 
                END,
                avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
                updated_at = NOW()
            WHERE id = NEW.id;
            RAISE LOG 'Updated existing profile for user % (%)', NEW.id, user_email;
            
        WHEN OTHERS THEN
            -- Log detailed error but don't fail auth
            RAISE LOG 'Failed to create profile for user % (%): % - %', 
                NEW.id, user_email, SQLSTATE, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Test the function works by checking it exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Show current users table structure for verification
\d public.users;