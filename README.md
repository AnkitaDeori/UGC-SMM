# UGC-SMM — Ankita's Creative Portfolio (Next.js + TypeScript + Tailwind)

Creative portfolio website for UGC and social media management.

Run `npm install` and `npm run dev` to start the site. The home route redirects to `/about`; the other pages are `/ugc` and `/smm`.

Edit portfolio copy in `lib/data.ts`. Set `PORTRAIT_SRC` there to add the About portrait.

## Secure UGC media uploads

The UGC gallery supports two public horizontal galleries (videos and photos). Admin uploads use Supabase email magic-link authentication and Supabase Storage. The Supabase anon key is intended for browser use; Storage row-level security policies, not the UI, enforce who can upload.

1. Create a Supabase project and enable email sign-in.
2. Copy `.env.local.example` to `.env.local`, then set the project URL, anon/publishable key, and the exact admin email address. Do not use a service-role key.
3. In Supabase SQL Editor, open `supabase/setup.sql`, replace every `REPLACE_WITH_ADMIN_EMAIL` with the exact admin email from `.env.local`, and run the complete script. The SQL creates the public media bucket and policies for viewing, uploading, editing details, and deleting files, plus the `portfolio_posters` table and admin-only poster-management policies. If changing the admin email later, rerun this script with the new email.
4. In Supabase Authentication URL settings, allow the local site URL (for example `http://localhost:3000`) and the production site URL for magic-link redirects.
5. Restart the Next.js server after editing `.env.local`. Open `/ugc`, choose **Admin**, request a sign-in link, and open it in the same browser where the site is running. Confirm the Admin panel shows the configured email. Then use **Add videos** or **Add photos**, enter a title and optional details, and submit the upload. The same signed-in admin session works on `/smm`: open the Poster gallery’s **Admin** panel to add, edit, or delete posters. Each poster’s category, brand, headline, supporting details, background color, and text color are stored in the `portfolio_posters` table.

The UGC galleries and poster gallery start empty; uploaded files and admin-created posters populate them. If upload, edit, or delete is rejected, check that the signed-in email exactly matches `NEXT_PUBLIC_SUPABASE_ADMIN_EMAIL`, all email placeholders in `supabase/setup.sql` were replaced, and the complete SQL script was run in the same Supabase project as the configured URL/key. After changing Storage policies or environment variables, sign out, restart the site, and sign in again. The UI shows the Storage error if Supabase still rejects an operation.

Uploads are limited to 100 MB and the image/video MIME types listed in `supabase/setup.sql`. Uploaded media files are stored in Supabase Storage; their titles and descriptions are stored in the RLS-protected `portfolio_media` table so admin edits persist without re-uploading the media. Keep every SQL admin email and `NEXT_PUBLIC_SUPABASE_ADMIN_EMAIL` in sync. Never put a Supabase service-role key in this application.
