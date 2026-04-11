# Supabase Setup

1. Create a project at https://supabase.com
2. Copy your project URL and anon key into `.env.local`
3. Go to **SQL Editor** in the Supabase dashboard
4. Paste the contents of `schema.sql` and run it
5. Enable **Email** auth in Authentication → Providers
6. Set Site URL to `http://localhost:3000` in Authentication → URL Configuration
7. Add `http://localhost:3000/auth/callback` to Redirect URLs
