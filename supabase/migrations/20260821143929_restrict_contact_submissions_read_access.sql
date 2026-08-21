/*
  # Restrict read access to contact_submissions

  1. Security
    - Drop policy "Authenticated users can view submissions", whose USING clause was
      `true`, meaning every signed-in account could read every stored customer
      enquiry (name, email, phone, message).
    - Revoke SELECT on public.contact_submissions from anon and authenticated so the
      table is no longer reachable or discoverable through the Data API / GraphQL.

  2. Notes
    - No application code reads this table, so nothing in the site breaks.
    - The owner continues to read submissions via Studio / service_role, which
      bypasses both RLS and these grants.
*/

DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.contact_submissions;

REVOKE SELECT ON public.contact_submissions FROM anon;
REVOKE SELECT ON public.contact_submissions FROM authenticated;
