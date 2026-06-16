// ============================================================
//  Spelly — site config (PUBLIC keys only — safe to commit)
// ============================================================
// Fill these in once. None of these are secrets:
//  - The Supabase "anon" key is a PUBLISHABLE key. It is safe in the
//    browser because the database is locked down with Row Level Security
//    (see supabase-schema.sql) — it can only INSERT signups, never read them.
//  - The Google Analytics Measurement ID is meant to live in the page.

window.SPELLY_CONFIG = {
  // Supabase → Project Settings → Data API
  //   Project URL,  e.g. https://abcdefghijklmnop.supabase.co
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  //   anon / public key (a long string starting with "eyJ...")
  SUPABASE_ANON_KEY: 'YOUR-ANON-PUBLIC-KEY',
};
