-- Query to check current users table state
SELECT 
  id, 
  email, 
  name, 
  credits, 
  plan, 
  subscription_status, 
  subscription_id,
  subscription_billing_period,
  payment_customer_id,
  created_at,
  updated_at
FROM public.users 
ORDER BY updated_at DESC;