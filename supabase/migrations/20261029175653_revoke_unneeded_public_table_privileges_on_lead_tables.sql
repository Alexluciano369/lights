/*
# Remove unneeded public privileges on lead tables

1. Modified Tables
- `contact_submissions`: anon and authenticated lose TRUNCATE, REFERENCES and TRIGGER.
- `leads`: anon and authenticated lose TRUNCATE, REFERENCES and TRIGGER. Their INSERT privilege (used by the public estimate form) is kept.

2. Security
- TRUNCATE is not governed by row level security, so a public visitor holding it could empty the whole table. No part of the site needs these privileges.

3. Notes
1. No data is changed or removed.
2. Policies are unchanged.
*/

REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.contact_submissions FROM anon, authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.leads FROM anon, authenticated;