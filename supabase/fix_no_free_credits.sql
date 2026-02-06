-- Fix to give 0 credits instead of 10 to new users
-- Run this in Supabase SQL Editor

-- Update the trigger function to give 0 credits and free plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update table defaults for future manual inserts
ALTER TABLE public.users ALTER COLUMN credits SET DEFAULT 0;
ALTER TABLE public.users ALTER COLUMN plan SET DEFAULT 'free';

-- Optionally: Reset existing free users who shouldn't have credits
-- Uncomment the line below if you want to remove credits from existing free users
-- UPDATE public.users SET credits = 0 WHERE plan = 'free' AND credits > 0;