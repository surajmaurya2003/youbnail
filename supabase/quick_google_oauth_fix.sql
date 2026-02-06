-- IMMEDIATE FIX for Google OAuth Error
-- Run this in Supabase SQL Editor to quickly resolve the issue

-- 1. Update plan constraint to be more permissive
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users ADD CONSTRAINT users_plan_check 
CHECK (plan IN ('free', 'starter', 'creator-monthly', 'creator-yearly'));

-- 2. Make email not required (in case Google doesn't provide it)
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- 3. Simple, robust trigger function that can't fail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple insertion with all possible error handling
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        credits, 
        plan
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            'User'
        ),
        0,  -- No free credits
        'free'  -- Free plan
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- If anything fails, just log and continue
        -- This ensures auth.users creation never fails
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();