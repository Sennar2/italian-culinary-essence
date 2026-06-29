import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type {} from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://italian-culinary-essence.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = ["/","/about","/chapters","/leadership","/academy","/initiatives","/events","/news","/membership","/partners","/contact","/gallery","/magazine","/podcasts"];
        let dynamic: string[] = [];
        try {
          const url = process.env.SUPABASE_URL;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (url && key) {
            const supabasePublic = createClient<Database>(url, key, {
              auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
            });
            const { data } = await supabasePublic.from("chapters").select("slug").eq("published", true);
            dynamic = (data ?? []).map((r) => `/chapters/${r.slug}`);
          }
        } catch { /* skip on error */ }

        const urls = [...paths, ...dynamic].map((p) =>
          `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});