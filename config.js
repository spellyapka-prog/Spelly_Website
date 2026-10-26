// ============================================================
//  Spelly — site config (PUBLIC keys only — safe to commit)
// ============================================================
// Fill these in once. None of these are secrets:
//  - The Supabase "anon" key is a PUBLISHABLE key. It is safe in the
//    browser because the database is locked down with Row Level Security
//    (see supabase-schema.sql) — it can only INSERT signups, never read them.
//  - The Google Analytics Measurement ID is meant to live in the page.

window.SPELLY_CONFIG = {
  // Supabase project URL (without the /rest/v1/ suffix)
  SUPABASE_URL: 'https://zqdxwvtpbmvnewhjbruv.supabase.co',
  // Supabase publishable (anon) key — safe in the browser, protected by RLS
  SUPABASE_ANON_KEY: 'sb_publishable__ZmNyV2rUK_lceKgDT3wVw_cx1TKYw_',
  // Web3Forms access key (web3forms.com) — public, tied to the support inbox.
  // Support-form messages are emailed there.
  WEB3FORMS_KEY: 'cf7dcf37-808f-4212-9446-45368e429d18',
};
