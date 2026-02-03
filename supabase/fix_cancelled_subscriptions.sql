-- Fix subscription_history records where users.subscription_status is 'cancelled'
-- but subscription_history.status is still 'active'

UPDATE public.subscription_history AS sh
SET 
  status = 'cancelled',
  cancelled_at = COALESCE(sh.cancelled_at, NOW())
FROM public.users AS u
WHERE 
  sh.user_id = u.id
  AND u.subscription_status = 'cancelled'
  AND sh.status != 'cancelled'
  AND sh.cancelled_at IS NULL;

-- Verify the update
SELECT 
  u.id,
  u.email,
  u.subscription_status AS user_status,
  sh.status AS history_status,
  sh.cancelled_at,
  sh.subscription_id
FROM public.users u
LEFT JOIN public.subscription_history sh ON u.id = sh.user_id
WHERE u.subscription_status = 'cancelled'
ORDER BY u.email;
