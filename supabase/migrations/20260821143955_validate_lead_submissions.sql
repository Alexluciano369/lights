/*
  # Validate public lead submissions server-side

  1. Changes
    - Add CHECK constraints to public.leads bounding every text column to a
      generous but finite length, so a direct call to the REST endpoint cannot
      store megabytes of text.
    - Require a non-blank name.
    - Require email to be either absent/blank or to contain "@".

  2. Notes
    - The quote form is anon-insertable by design (public marketing site), so the
      insert policy stays as-is; these constraints are the server-side re-check of
      what the browser form only suggests.
    - Limits are well above anything a real homeowner submission needs, so
      legitimate leads are unaffected.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_name_valid') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_name_valid
      CHECK (btrim(name) <> '' AND length(name) <= 200);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_email_valid') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_email_valid
      CHECK (email IS NULL OR btrim(email) = '' OR (length(email) <= 320 AND position('@' in email) > 1));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_phone_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_phone_len CHECK (phone IS NULL OR length(phone) <= 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_address_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_address_len CHECK (address IS NULL OR length(address) <= 300);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_city_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_city_len CHECK (city IS NULL OR length(city) <= 120);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_service_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_service_len CHECK (service IS NULL OR length(service) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_message_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_message_len CHECK (message IS NULL OR length(message) <= 5000);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_page_url_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_page_url_len CHECK (page_url IS NULL OR length(page_url) <= 2000);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_referrer_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_referrer_len CHECK (referrer IS NULL OR length(referrer) <= 2000);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_user_agent_len') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_user_agent_len CHECK (user_agent IS NULL OR length(user_agent) <= 500);
  END IF;
END $$;
