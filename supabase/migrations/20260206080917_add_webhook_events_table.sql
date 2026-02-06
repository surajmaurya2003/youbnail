-- Create webhook events tracking table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_hash text UNIQUE NOT NULL, -- Hash of event content for deduplication
  event_type text NOT NULL,
  subscription_id text,
  user_id uuid,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_hash ON webhook_events (event_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription ON webhook_events (subscription_id, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events (created_at);

-- Clean up old webhook events (keep only last 30 days)
-- This prevents the table from growing indefinitely
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_events 
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up old events (uncomment if needed)
-- SELECT cron.schedule('cleanup-webhook-events', '0 2 * * *', 'SELECT cleanup_old_webhook_events()');
