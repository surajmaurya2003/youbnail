-- Update database schema to support free users
-- Run this in Supabase SQL Editor

-- Step 1: Update the plan constraint to include 'free'
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_plan_check 
CHECK (plan IN ('free', 'starter', 'pro'));

-- Step 2: Update default plan to 'free' and default credits to 0
ALTER TABLE public.users 
ALTER COLUMN plan SET DEFAULT 'free';

ALTER TABLE public.users 
ALTER COLUMN credits SET DEFAULT 0;

-- Step 3: Update the trigger function to create free users with 0 credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, credits, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    0,  -- Free users get 0 credits
    'free'  -- Free plan (no paid plan)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update existing users who have 'starter' plan but haven't paid
-- (Optional - only run if you want to convert existing starter users to free)
-- UPDATE public.users 
-- SET plan = 'free', credits = 0 
-- WHERE plan = 'starter' AND subscription_status IS NULL OR subscription_status = 'inactive';
