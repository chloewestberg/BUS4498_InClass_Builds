-- Stage 7: photo uploads.
-- Each post can have one flyer photo. The AI agent uploads it; the website only shows it.

-- The public link to the post's flyer, or empty when there is no photo.
alter table public.events add column if not exists flyer_url text not null default '';

-- The website may read the link (it's one more column on the "menu").
grant select (flyer_url) on public.events to anon, authenticated;

-- A public storage bucket for flyers: 5 MB per file, JPG and PNG only.
-- Public means anyone with a link can open a photo. There are no storage policies for the website,
-- so visitors can't upload, change, or delete photos; only the agent (with the secret key) uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('flyers', 'flyers', true, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
