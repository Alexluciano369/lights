/*
  # Reduce leads table privileges to insert only

  1. Security
    - Revoke SELECT, UPDATE and DELETE on public.leads from anon and authenticated.
      The public quote form only ever inserts, and it sends
      `Prefer: return=minimal`, so it never reads the row back.
    - INSERT remains granted so the quote form keeps working.

  2. Notes
    - This matches the stated intent of the original migration: the general public
      must not be able to read or modify leads.
    - Removing SELECT also removes the table from the anon/authenticated GraphQL
      schema, closing the two exposure warnings raised for it.
*/

REVOKE SELECT, UPDATE, DELETE ON public.leads FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.leads FROM authenticated;
