DROP POLICY IF EXISTS "public submit newsletter" ON public.newsletter_subs;
DROP POLICY IF EXISTS "public submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "public submit membership enquiries" ON public.membership_enquiries;

CREATE POLICY "public submit newsletter"
ON public.newsletter_subs FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (locale IS NULL OR length(locale) <= 8)
);

CREATE POLICY "public submit contact messages"
ON public.contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (department IS NULL OR length(department) <= 80)
  AND length(message) BETWEEN 5 AND 4000
);

CREATE POLICY "public submit membership enquiries"
ON public.membership_enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (organisation IS NULL OR length(organisation) <= 160)
  AND (country IS NULL OR length(country) <= 80)
  AND (tier IS NULL OR length(tier) <= 80)
  AND (message IS NULL OR length(message) <= 4000)
);

REVOKE EXECUTE ON FUNCTION public.current_member_id() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.current_member_id() FROM anon;