
-- 1) Extend role enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'member' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'member';
  END IF;
END $$;

-- 2) Generic enums
DO $$ BEGIN CREATE TYPE public.member_status AS ENUM ('pending','active','suspended','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.billing_frequency AS ENUM ('monthly','yearly','one_off','on_enquiry'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.content_visibility AS ENUM ('public','members','tier'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.lesson_kind AS ENUM ('video','pdf','scorm','text'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.progress_status AS ENUM ('not_started','in_progress','completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.access_content_type AS ENUM ('module','news','magazine_issue','article','podcast','event'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) membership_tiers
CREATE TABLE public.membership_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price_cents integer,
  currency text DEFAULT 'EUR',
  billing_frequency public.billing_frequency NOT NULL DEFAULT 'yearly',
  description text,
  benefits text[] DEFAULT '{}',
  access_level integer NOT NULL DEFAULT 1,
  payment_link text,
  cta_label text DEFAULT 'Join now',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.membership_tiers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.membership_tiers TO authenticated;
GRANT ALL ON public.membership_tiers TO service_role;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiers_public_read" ON public.membership_tiers FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "tiers_admin_write" ON public.membership_tiers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_tiers_updated BEFORE UPDATE ON public.membership_tiers FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) members
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  country text,
  city text,
  profession text,
  company text,
  tier_id uuid REFERENCES public.membership_tiers(id) ON DELETE SET NULL,
  status public.member_status NOT NULL DEFAULT 'pending',
  join_date date NOT NULL DEFAULT (now()::date),
  renewal_date date,
  payment_status text,
  payment_reference text,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_self_read" ON public.members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "members_self_update" ON public.members FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "members_admin_insert" ON public.members FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "members_admin_delete" ON public.members FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_members_updated BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5) Auto-create member row on signup
CREATE OR REPLACE FUNCTION public.handle_new_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.members (user_id, email, full_name, status)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'pending')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created_member ON auth.users;
CREATE TRIGGER on_auth_user_created_member AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_member();

-- 6) Magazine
CREATE TABLE public.magazine_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  cover_url text,
  issue_date date,
  summary text,
  public_preview boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.magazine_issues TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.magazine_issues TO authenticated;
GRANT ALL ON public.magazine_issues TO service_role;
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mag_issue_public_read" ON public.magazine_issues FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "mag_issue_admin_write" ON public.magazine_issues FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_mag_issue_updated BEFORE UPDATE ON public.magazine_issues FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.magazine_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  author text,
  body text,
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issue_id, slug)
);
GRANT SELECT ON public.magazine_articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.magazine_articles TO authenticated;
GRANT ALL ON public.magazine_articles TO service_role;
ALTER TABLE public.magazine_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mag_art_public_read" ON public.magazine_articles FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "mag_art_admin_write" ON public.magazine_articles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_mag_art_updated BEFORE UPDATE ON public.magazine_articles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 7) Podcasts
CREATE TABLE public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  episode_number integer,
  description text,
  audio_url text,
  cover_url text,
  spotify_url text,
  apple_url text,
  youtube_url text,
  category text,
  publish_date date,
  visibility public.content_visibility NOT NULL DEFAULT 'public',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.podcast_episodes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.podcast_episodes TO authenticated;
GRANT ALL ON public.podcast_episodes TO service_role;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pod_public_read" ON public.podcast_episodes FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pod_admin_write" ON public.podcast_episodes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pod_updated BEFORE UPDATE ON public.podcast_episodes FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 8) Academy modules + lessons
CREATE TABLE public.academy_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text,
  description text,
  cover_url text,
  duration_minutes integer,
  certificate_eligible boolean NOT NULL DEFAULT false,
  passing_score integer,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_modules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.academy_modules TO authenticated;
GRANT ALL ON public.academy_modules TO service_role;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acad_mod_member_read" ON public.academy_modules FOR SELECT TO authenticated USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "acad_mod_admin_write" ON public.academy_modules FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_acad_mod_updated BEFORE UPDATE ON public.academy_modules FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.academy_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  kind public.lesson_kind NOT NULL DEFAULT 'video',
  video_url text,
  pdf_url text,
  scorm_package_path text,
  scorm_launch_url text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_lessons TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.academy_lessons TO authenticated;
GRANT ALL ON public.academy_lessons TO service_role;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acad_les_member_read" ON public.academy_lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "acad_les_admin_write" ON public.academy_lessons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_acad_les_updated BEFORE UPDATE ON public.academy_lessons FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 9) Progress + certificates
CREATE TABLE public.member_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  status public.progress_status NOT NULL DEFAULT 'not_started',
  score numeric,
  scorm_suspend_data text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_course_progress TO authenticated;
GRANT ALL ON public.member_course_progress TO service_role;
ALTER TABLE public.member_course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_self" ON public.member_course_progress FOR ALL TO authenticated
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_progress_updated BEFORE UPDATE ON public.member_course_progress FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  certificate_number text NOT NULL UNIQUE,
  pdf_url text,
  UNIQUE(member_id, module_id)
);
GRANT SELECT ON public.certificates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cert_self_read" ON public.certificates FOR SELECT TO authenticated USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cert_admin_write" ON public.certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 10) Generic content_access
CREATE TABLE public.content_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type public.access_content_type NOT NULL,
  content_id uuid NOT NULL,
  tier_id uuid NOT NULL REFERENCES public.membership_tiers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_id, tier_id)
);
GRANT SELECT ON public.content_access TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_access TO authenticated;
GRANT ALL ON public.content_access TO service_role;
ALTER TABLE public.content_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_member_read" ON public.content_access FOR SELECT TO authenticated USING (true);
CREATE POLICY "access_admin_write" ON public.content_access FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 11) Extend news/events
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS visibility public.content_visibility NOT NULL DEFAULT 'public';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS visibility public.content_visibility NOT NULL DEFAULT 'public';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS booking_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sponsors text[] DEFAULT '{}';

-- 12) Helper: get current member id
CREATE OR REPLACE FUNCTION public.current_member_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.members WHERE user_id = auth.uid() LIMIT 1
$$;
