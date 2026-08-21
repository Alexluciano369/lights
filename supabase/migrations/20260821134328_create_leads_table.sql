/*
# Create leads table for quote form submissions

1. New Tables
   - `leads` — captures every quote request submitted from the site.
     - `id` (uuid, primary key)
     - `name` (text, required)
     - `email` (text)
     - `phone` (text)
     - `address` (text)
     - `city` (text) — target city slug or free-text city
     - `service` (text) — target service slug or free-text service
     - `message` (text)
     - `page_url` (text) — URL of the page the form was submitted from
     - `referrer` (text) — HTTP referrer for attribution
     - `user_agent` (text) — browser UA string
     - `created_at` (timestamptz, default now())
2. Security
   - Enable RLS on `leads`.
   - INSERT allowed for anon + authenticated (public marketing site with no login).
   - No SELECT / UPDATE / DELETE policies — the general public cannot read or modify leads.
     Business owner reads leads through Supabase Studio with the service-role key.
3. Notes
   - Single-tenant marketing site. Every visitor is the anon role.
   - Adds an index on `created_at DESC` for chronological review.
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  service text,
  message text,
  page_url text,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_leads" ON leads;
CREATE POLICY "public_insert_leads"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
