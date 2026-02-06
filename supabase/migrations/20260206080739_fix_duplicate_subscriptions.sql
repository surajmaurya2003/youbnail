-- Fix duplicate subscription issues
-- Add unique constraint to prevent the same subscription_id being assigned to different users

-- First, clean up existing duplicates by keeping only the latest record for each subscription_id
WITH ranked_subscriptions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY subscription_id ORDER BY created_at DESC) as rn
  FROM subscription_history 
  WHERE subscription_id IS NOT NULL
)
DELETE FROM subscription_history 
WHERE id IN (
  SELECT id FROM ranked_subscriptions WHERE rn > 1
);

-- Add unique constraint to prevent duplicate subscription_ids
-- This ensures one subscription can only belong to one user
ALTER TABLE subscription_history 
ADD CONSTRAINT unique_subscription_id 
UNIQUE (subscription_id);

-- Create index for better performance on subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_lookup 
ON subscription_history (subscription_id, status, created_at DESC);

-- Add composite unique constraint for user + active subscription
-- This prevents multiple active subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_active_subscription
ON subscription_history (user_id, status)
WHERE status = 'active';
