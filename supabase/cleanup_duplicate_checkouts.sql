-- Clean up duplicate subscription_history records created from double-click checkout
-- This keeps only the oldest record for each unique combination

-- Step 1: Show what will be deleted (for verification)
SELECT 
  sh.id,
  sh.user_id,
  u.email,
  sh.subscription_id,
  sh.product_id,
  sh.billing_period,
  sh.status,
  sh.created_at,
  ROW_NUMBER() OVER (
    PARTITION BY sh.user_id, sh.subscription_id, sh.product_id, sh.billing_period, sh.status 
    ORDER BY sh.created_at ASC
  ) AS row_num
FROM public.subscription_history sh
LEFT JOIN public.users u ON sh.user_id = u.id
WHERE sh.status = 'active'
ORDER BY sh.user_id, sh.created_at;

-- Step 2: Delete duplicates (keeps the oldest record for each unique combination)
WITH ranked_records AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, subscription_id, product_id, billing_period, status 
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

-- Step 3: Verify - Show remaining subscription_history records
SELECT 
  sh.id,
  sh.user_id,
  u.email,
  sh.subscription_id,
  sh.product_id,
  sh.billing_period,
  sh.status,
  sh.amount_paid,
  sh.created_at
FROM public.subscription_history sh
LEFT JOIN public.users u ON sh.user_id = u.id
WHERE sh.status = 'active'
ORDER BY sh.created_at DESC;
