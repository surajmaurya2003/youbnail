-- Update user subscription status based on webhook data
UPDATE users 
SET 
  plan = 'starter',
  credits = 30,
  subscription_id = 'sub_0NXCciZbOMceuIpEGslXp',
  subscription_status = 'active',
  subscription_product_id = 'pdt_0NWhJkEv6LSnQGtBixl57',
  subscription_billing_period = 'monthly',
  subscription_started_at = '2026-01-27T14:39:18.545559Z',
  subscription_ends_at = '2026-02-27T14:39:35.578085Z',
  payment_customer_id = 'cus_0NWtuntPrJHhvKVYCTNyc',
  updated_at = NOW()
WHERE id = '890cbe1d-b2b2-4441-ae71-50c786f6ce11';

-- Verify the update
SELECT 
  id,
  email,
  name,
  plan,
  credits,
  subscription_status,
  subscription_id,
  subscription_billing_period,
  subscription_started_at,
  subscription_ends_at
FROM users 
WHERE id = '890cbe1d-b2b2-4441-ae71-50c786f6ce11';