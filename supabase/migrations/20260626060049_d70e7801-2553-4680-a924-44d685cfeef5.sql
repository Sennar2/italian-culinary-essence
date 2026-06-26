ALTER TABLE public.nav_links
  ADD COLUMN IF NOT EXISTS in_more_menu boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_cta boolean NOT NULL DEFAULT false;

-- Reset header nav with clean editorial set
DELETE FROM public.nav_links WHERE location = 'header';

INSERT INTO public.nav_links (label, url, location, sort_order, active, external, in_more_menu, is_cta) VALUES
  ('About',       '/about',       'header',  10, true, false, false, false),
  ('Academy',     '/academy',     'header',  20, true, false, false, false),
  ('Events',      '/events',      'header',  30, true, false, false, false),
  ('Membership',  '/membership',  'header',  40, true, false, false, false),
  ('Chapters',    '/chapters',    'header',  50, true, false, true,  false),
  ('Leadership',  '/leadership',  'header',  60, true, false, true,  false),
  ('Initiatives', '/initiatives', 'header',  70, true, false, true,  false),
  ('Gallery',     '/gallery',     'header',  80, true, false, true,  false),
  ('News',        '/news',        'header',  90, true, false, true,  false),
  ('Partners',    '/partners',    'header', 100, true, false, true,  false),
  ('Contact',     '/contact',     'header', 110, true, false, true,  false),
  ('Become a Member', '/membership', 'header', 200, true, false, false, true);