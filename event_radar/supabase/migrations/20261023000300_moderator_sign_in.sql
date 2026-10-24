-- Stage 8: moderator sign-in.
-- A signed-in moderator (Supabase Auth, the "authenticated" role) can see every post
-- and approve or reject the ones that are waiting.
--
-- This is safe only because new sign-ups are turned off
-- (Authentication → Sign In / Providers → "Allow new users to sign up" is off).
-- Then the only signed-in users are the moderator accounts you create yourself.

-- Moderators can read every row, not only published ones.
drop policy if exists "Moderators can read every post" on public.events;
create policy "Moderators can read every post"
  on public.events for select
  to authenticated
  using (true);

-- Moderators can change a post, but only to published, waiting, or rejected (never archived or anything else).
drop policy if exists "Moderators can review posts" on public.events;
create policy "Moderators can review posts"
  on public.events for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected'));

-- Grants: moderators may read the whole table, and change only the review columns.
grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by) on public.events to authenticated;

-- Visitors (anon) keep only what Stage 4 and Stage 7 gave them: published rows, public columns, no changes.
