
-- 1. Chapters: address, contact_email, active
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- 2. gallery_images
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  caption text,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published gallery" ON public.gallery_images FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_gallery_updated BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3. banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  event_date timestamptz,
  location text,
  cta_label text,
  cta_url text,
  image_url text,
  enabled boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled banners" ON public.banners FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "admins manage banners" ON public.banners FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_banners_updated BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. nav_links
CREATE TABLE IF NOT EXISTS public.nav_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  location text NOT NULL DEFAULT 'header', -- header | footer_quick | footer_programme | footer_legal | footer_social
  social_platform text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  external boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_links TO authenticated;
GRANT ALL ON public.nav_links TO service_role;
ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active nav" ON public.nav_links FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "admins manage nav" ON public.nav_links FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_nav_updated BEFORE UPDATE ON public.nav_links FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5. featured_images
CREATE TABLE IF NOT EXISTS public.featured_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  image_url text,
  alt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.featured_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.featured_images TO authenticated;
GRANT ALL ON public.featured_images TO service_role;
ALTER TABLE public.featured_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read featured images" ON public.featured_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage featured images" ON public.featured_images FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_featured_images_updated BEFORE UPDATE ON public.featured_images FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed page_key rows so admin form lists them
INSERT INTO public.featured_images (page_key) VALUES
  ('home'), ('about'), ('academy'), ('events'),
  ('membership'), ('news'), ('partners'),
  ('leadership'), ('chapters'), ('contact')
ON CONFLICT (page_key) DO NOTHING;

-- 6. Storage policies for media bucket (admin-only writes, public reads via signed URLs)
CREATE POLICY "admins upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "anyone read media"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');
