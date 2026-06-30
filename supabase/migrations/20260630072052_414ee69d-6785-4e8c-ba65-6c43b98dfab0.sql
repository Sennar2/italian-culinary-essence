GRANT SELECT ON public.academy_items TO anon;
GRANT SELECT ON public.chapters TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.initiatives TO anon;
GRANT SELECT ON public.leadership TO anon;
GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.partners TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.testimonials TO anon;
GRANT INSERT ON public.newsletter_subs TO anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT INSERT ON public.membership_enquiries TO anon, authenticated;

CREATE POLICY "public read published academy items"
ON public.academy_items FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public read published chapters"
ON public.chapters FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public read published events"
ON public.events FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public read published initiatives"
ON public.initiatives FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public read published leadership"
ON public.leadership FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public read published news"
ON public.news FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public read published partners"
ON public.partners FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public read site settings"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (id = 1);

CREATE POLICY "public read published testimonials"
ON public.testimonials FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "public submit newsletter"
ON public.newsletter_subs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "public submit contact messages"
ON public.contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "public submit membership enquiries"
ON public.membership_enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "members can create own profile"
ON public.members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());