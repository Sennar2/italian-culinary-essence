## Plan to fix the persistent console error

The error is still present because the public website is importing server functions that dynamically import the privileged backend client. Those modules are also reachable from browser-rendered code, so the browser bundle attempts to evaluate `client.server.ts` and cannot see the server-only environment variables.

### Fix
1. Replace public read functions with a browser-safe/public backend client pattern:
   - Use `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` inside public server function handlers.
   - Keep the privileged service-role client only for admin/protected operations.

2. Update these public content modules:
   - `src/lib/api/public-content.functions.ts`
   - public-read section of `src/lib/api/website.functions.ts`
   - `src/routes/sitemap[.]xml.ts` if it uses the privileged client for public sitemap data.

3. Preserve admin CMS behavior:
   - Leave admin CRUD/upload functions using the service-role client after auth/admin guard.
   - Do not change generated integration files.

4. Validate:
   - Confirm the browser console no longer reports `Missing Supabase environment variable(s): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY`.
   - Check homepage/header/footer still load dynamic admin-controlled content.