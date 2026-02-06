-- Manual cleanup script for duplicate subscriptions
-- Run this in your Supabase SQL editor if needed

-- 1. View current duplicate subscription status
SELECT 
  subscription_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(user_id::text, ', ') as user_ids,
  STRING_AGG(status, ', ') as statuses
FROM subscription_history 
WHERE subscription_id IS NOT NULL
GROUP BY subscription_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. View users with multiple active subscriptions (should be 0 after fixes)
SELECT 
  user_id,
  COUNT(*) as active_subscription_count,
  STRING_AGG(subscription_id, ', ') as subscription_ids
FROM subscription_history 
WHERE status = 'active'
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 3. If you need to manually fix specific duplicates, use this template:
-- Replace 'DUPLICATE_SUBSCRIPTION_ID' with the actual ID
/*
-- Cancel all but the most recent subscription for a specific subscription_id
WITH ranked_subs AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY subscription_id ORDER BY created_at DESC) as rn
  FROM subscription_history 
  WHERE subscription_id = 'DUPLICATE_SUBSCRIPTION_ID'
)
UPDATE subscription_history 
SET status = 'cancelled', cancelled_at = now()
WHERE id IN (
  SELECT id FROM ranked_subs WHERE rn > 1
);
*/