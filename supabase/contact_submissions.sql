-- Create contact_submissions table for logging form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create an index on the submitted_at column for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at 
ON contact_submissions(submitted_at DESC);

-- Enable Row Level Security (optional, for additional security)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to insert and read
CREATE POLICY "Allow service role full access" 
ON contact_submissions 
FOR ALL 
TO service_role 
USING (true);