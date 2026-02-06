-- Enable RLS on webhook_events table for security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access webhook events
-- This table should only be accessed by Edge Functions, not by regular users
CREATE POLICY "Service role only access" ON webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No policies for authenticated or public users
-- This ensures only server-side functions can read/write webhook events
