-- Migration to add subscription fields and update plan constraint

-- First drop the old constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;

-- Add new columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_product_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_billing_period TEXT,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_customer_id TEXT;

-- Add the updated constraint with new plan types
ALTER TABLE public.users 
ADD CONSTRAINT users_plan_check 
CHECK (plan IN ('starter', 'creator-monthly', 'creator-yearly'));
