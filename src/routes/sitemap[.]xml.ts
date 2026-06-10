import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = ""; // TODO: set once a project URL is assigned

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = ["/","/about","/chapters","/leadership","/academy","/initiatives","/events","/news","/membership","/partners","/contact"];
        let dynamic: string[] = [];
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data } = await supabaseAdmin.from("chapters").select("slug").eq("published", true);
          dynamic = (data ?? []).map((r) => `/chapters/${r.slug}`);
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