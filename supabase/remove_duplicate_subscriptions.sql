-- Remove duplicate subscription_history records
-- Keeps the oldest record for each unique (user_id, subscription_id, status) combination

WITH ranked_records AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, subscription_id, status 
      ORDER BY created_at ASC
    ) AS rn
  FROM public.subscription_history
  WHERE status = 'active'
)
DELETE FROM public.subscription_history
WHERE id IN (
  SELECT id 
  FROM ranked_records 
  WHERE rn > 1
);

-- Verify: Show remaining subscription_history records
SELECT 
  sh.id,
  sh.user_id,
  u.email,
  sh.subscription_id,
  sh.status,
  sh.billing_period,
  sh.amount_paid,
  sh.created_at
FROM public.subscription_history sh
LEFT JOIN public.users u ON sh.user_id = u.id
ORDER BY sh.created_at DESC;
