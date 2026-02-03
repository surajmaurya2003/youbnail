-- Check if subscription IDs are from test or live mode
SELECT 
  id,
  email,
  plan,
  subscription_id,
  subscription_status,
  payment_customer_id,
  subscription_started_at,
  CASE 
    WHEN subscription_id LIKE '%test%' OR subscription_id LIKE 'sub_test%' THEN '🧪 TEST MODE'
    WHEN subscription_id LIKE 'sub_%' THEN '🟢 LIVE MODE'
    ELSE '❓ UNKNOWN'
  END as subscription_mode,
  created_at
FROM public.users
WHERE subscription_id IS NOT NULL
ORDER BY created_at DESC;
