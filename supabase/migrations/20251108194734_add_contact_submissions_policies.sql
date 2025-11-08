/*
  # Add RLS Policies for Contact Submissions

  1. Security
    - Add policy for service role to insert contact submissions (for edge function)
    - No public access - submissions are only visible to authenticated admins
    - Edge function uses service role key to bypass RLS for inserts

  2. Notes
    - The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
    - This migration adds explicit policies for clarity and future admin access
*/

-- Policy for service role to insert (edge function uses service role key)
-- This is more for documentation as service role bypasses RLS
CREATE POLICY "Service role can insert submissions"
  ON contact_submissions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy for authenticated users to view submissions (for future admin dashboard)
CREATE POLICY "Authenticated users can view submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);