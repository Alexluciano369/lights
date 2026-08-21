/*
  # Remove write privileges on contact_submissions from public roles

  1. Security
    - Revoke INSERT, UPDATE and DELETE on public.contact_submissions from anon and
      authenticated. No application code touches this table; only the owner
      (service_role, which bypasses grants and RLS) needs access to the 13 stored
      customer enquiries.
    - This removes the standing ability to overwrite or delete real customer
      records that was only being held back by the absence of a matching policy.

  2. Notes
    - The existing service_role INSERT policy is left in place for the owner-side
      pipeline that wrote these rows.
*/

REVOKE INSERT, UPDATE, DELETE ON public.contact_submissions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.contact_submissions FROM authenticated;
