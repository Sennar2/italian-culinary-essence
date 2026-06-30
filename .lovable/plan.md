## Problem
The error is not caused by the public website anymore. It is coming from admin save/list functions that still call the privileged backend client requiring `SUPABASE_SERVICE_ROLE_KEY`. In the current Lovable Cloud runtime, admin CMS actions should not require that key directly.

## Plan
1. **Replace admin service-role reads/writes with authenticated backend access**
   - Update admin server functions to use the authenticated client from `requireSupabaseAuth` (`context.supabase`) instead of importing the privileged backend client.
   - Keep the existing admin role check, but run it through the authenticated backend client/RPC rather than `supabaseAdmin`.

2. **Apply the fix across all admin modules that can show this toast**
   - Content CMS: leadership, events, news, initiatives, partners, academy items, testimonials, settings.
   - Website CMS: gallery, banners, nav links, featured images, uploads where possible.
   - Membership/media CMS: tiers, magazine, podcasts, academy modules, members, access rules, enquiries/chapters as needed.

3. **Preserve security**
   - Keep `requireSupabaseAuth` on admin server functions.
   - Keep admin-only role enforcement before any admin mutation.
   - Do not expose or ask for any service key.

4. **Check database permissions if needed**
   - If authenticated admin writes are blocked by table permissions/RLS, add a focused backend migration with explicit grants and admin-only policies using the existing `has_role()` function.

5. **Validate the exact failing flow**
   - Re-test the admin save shown in your screenshot.
   - Confirm the `Missing Supabase environment variable(s): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY` toast no longer appears.
   - Check no remaining client-reachable admin function imports the privileged backend client.

```xml
<presentation-actions>
  <presentation-open-history>View History</presentation-open-history>
</presentation-actions>
```

<presentation-actions>
<presentation-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</presentation-link>
</presentation-actions>