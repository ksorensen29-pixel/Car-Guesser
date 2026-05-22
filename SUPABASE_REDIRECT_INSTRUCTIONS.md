Supabase Magic Link Redirect — Action Steps
=========================================

1) Compute the exact app redirect URL used by the app

- Open your dashboard page and click the "Show target" debug button. It prints the computed magic-link redirect URL in the browser console and displays it on the page.
- Example values you may see:
  - https://your-host.example.com/cargamehtml.html
  - https://your-host.example.com/ScriptMats/cargamehtml.html

2) Add the exact URL(s) to Supabase

- Go to the Supabase Console → Authentication → Settings → Redirect URLs.
- Add the full absolute URL(s) printed by the app. If your site is served at a subpath (e.g. `/ScriptMats/`) add that full path.
- Example entries to add:
  - https://your-host.example.com/cargamehtml.html
  - https://your-host.example.com/ScriptMats/cargamehtml.html

3) Optional: Add a more permissive base path

- If you cannot predict all subpaths, you can also add the base site URL (less specific), e.g. `https://your-host.example.com/` — but be mindful of security and allowed redirect practices.

4) Request a fresh magic link

- On your app's `dashboard.html` use the "Send test magic link" button to generate a new OTP email.
- Check the email and confirm the link's target matches one of the allowed redirect URLs you added in step 2.

5) If the emailed link still lands on `/ScriptMats/dashboard.html`

- That indicates the magic link was generated earlier (stale) or your Supabase project settings still include an older redirect URL. Re-generate the magic link after adding the correct redirect URL(s) and re-test.
- If you prefer to accept the older links, keep the `/ScriptMats/dashboard.html` redirect file in the repo (it already exists and forwards to `cargamehtml.html`).

Notes
- I cannot access your Supabase Console from this environment. Follow the above steps in the Supabase UI to confirm and update redirect URLs.
- Use the debug "Show target" button to get the exact URL you must add.

6) Optional: Prevent links from pointing to ephemeral hosts (github.dev)

- If you generate magic links while working in editor-preview hosts (like `*.github.dev`), the app will compute the redirect base using the current window origin — and Supabase will send that exact host in the magic link. To avoid this, set the `MAGIC_LINK_REDIRECT_BASE` constant in `supabase-config.js` to your production origin (for example `https://your-host.example.com`).
- Example: open `supabase-config.js` and set:

  export const MAGIC_LINK_REDIRECT_BASE = 'https://your-host.example.com';

- When set, all generated magic links will point to `https://your-host.example.com/cargamehtml.html` regardless of where you triggered the sign-in.

7) Runtime override (no code edit required)

- You can set a runtime redirect base from the dashboard UI without editing code. On `dashboard.html` use the debug block and enter your desired redirect base in the "Optional redirect base" input, then click "Save". The value is stored in `localStorage` under `magicLinkRedirectBase` and will be used for new magic links.
- Use this when you want to test or force production links while triggering sign-ins from a dev preview host.

If you'd like, paste the magic-link URL you receive here and I'll inspect it and recommend the exact console entry to add.
