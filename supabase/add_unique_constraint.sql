-- Add unique constraint to prevent duplicate subscription_history records
-- This ensures only ONE active subscription per user can exist at a time

-- First, let's see if there are any current duplicates
SELECT 
  user_id,
  subscription_id,
  COUNT(*) as count
FROM subscription_history
WHERE status = 'active'
GROUP BY user_id, subscription_id
HAVING COUNT(*) > 1;

-- Create a unique index to prevent duplicates
-- This allows only one active subscription per subscription_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_subscription 
ON subscription_history (subscription_id, user_id) 
WHERE status = 'active';

-- Alternative: If you want to allow multiple subscriptions but prevent duplicates within a short time window,
-- you can use a partial unique index on subscription_id + created_at rounded to nearest second
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_subscription_per_second 
-- ON subscription_history (subscription_id, date_trunc('second', created_at));
