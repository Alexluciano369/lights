/*
  # Contact Form Submissions

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `service` (text)
      - `message` (text)
      - `page_url` (text)
      - `created_at` (timestamptz)
      - `emailed` (boolean, default false)
  
  2. Security
    - Enable RLS on `contact_submissions` table
    - No public access policies (admin only)
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service text NOT NULL,
  message text DEFAULT '',
  page_url text,
  created_at timestamptz DEFAULT now(),
  emailed boolean DEFAULT false
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
