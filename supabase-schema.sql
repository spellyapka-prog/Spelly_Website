-- ============================================================
--  Spelly waitlist — Supabase schema
--  Run this once in:  Supabase dashboard → SQL Editor → New query
-- ============================================================

-- 1) Table that stores every signup.
create table if not exists public.subscribers (
  id          bigint generated always as identity primary key,
  email       text not null,
  created_at  timestamptz not null default now(),
  source      text,                       -- where the signup came from (e.g. 'waitlist')
  referrer    text,                       -- the page the visitor arrived from
  constraint subscribers_email_key unique (email)   -- no duplicate emails
);

-- 2) Turn on Row Level Security so the table is private by default.
alter table public.subscribers enable row level security;

-- 3) Allow the public ("anon") key to INSERT signups only.
--    There is deliberately NO select/update/delete policy for anon,
--    so nobody can read or change the list from the browser.
--    You still see everything in the Supabase Table Editor (you are the owner).
drop policy if exists "anon can insert waitlist signups" on public.subscribers;
create policy "anon can insert waitlist signups"
  on public.subscribers
  for insert
  to anon
  with check (true);
