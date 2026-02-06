-- Migration to update plan values and add constraint

-- First drop the old constraint completely
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;

-- Update any 'pro' plans to 'creator-monthly' (temporary fix)
UPDATE public.users SET plan = 'creator-monthly' WHERE plan = 'pro';

-- Update any other invalid plan values to 'starter'
UPDATE public.users SET plan = 'starter' WHERE plan NOT IN ('starter', 'creator-monthly', 'creator-yearly');

-- Add the updated constraint with new plan types
ALTER TABLE public.users 
ADD CONSTRAINT users_plan_check 
CHECK (plan IN ('starter', 'creator-monthly', 'creator-yearly'));