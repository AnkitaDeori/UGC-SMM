insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio media is publicly readable" on storage.objects;
create policy "Portfolio media is publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

drop policy if exists "Configured admin can upload portfolio media" on storage.objects;
create policy "Configured admin can upload portfolio media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and lower(auth.jwt() ->> 'email') = lower('deoriankita2004@gmail.com')
);

drop policy if exists "Configured admin can update portfolio media" on storage.objects;
create policy "Configured admin can update portfolio media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and lower(auth.jwt() ->> 'email') = lower('deoriankita2004@gmail.com')
)
with check (
  bucket_id = 'portfolio-media'
  and lower(auth.jwt() ->> 'email') = lower('deoriankita2004@gmail.com')
);

drop policy if exists "Configured admin can delete portfolio media" on storage.objects;
create policy "Configured admin can delete portfolio media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and lower(auth.jwt() ->> 'email') = lower('deoriankita2004@gmail.com')
);

create table if not exists public.portfolio_media (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('video', 'photo')),
  object_path text not null unique,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  check (
    (kind = 'video' and object_path like 'videos/%')
    or (kind = 'photo' and object_path like 'photos/%')
  )
);

alter table public.portfolio_media enable row level security;

grant select on public.portfolio_media to anon, authenticated;
grant insert, update, delete on public.portfolio_media to authenticated;

drop policy if exists "Portfolio media details are publicly readable" on public.portfolio_media;
create policy "Portfolio media details are publicly readable"
on public.portfolio_media for select
to anon, authenticated
using (true);

drop policy if exists "Configured admin can add portfolio media details" on public.portfolio_media;
create policy "Configured admin can add portfolio media details"
on public.portfolio_media for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
);

drop policy if exists "Configured admin can edit portfolio media details" on public.portfolio_media;
create policy "Configured admin can edit portfolio media details"
on public.portfolio_media for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
);

drop policy if exists "Configured admin can delete portfolio media details" on public.portfolio_media;
create policy "Configured admin can delete portfolio media details"
on public.portfolio_media for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
);

create table if not exists public.portfolio_posters (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (char_length(kind) between 1 and 60),
  brand text not null check (char_length(brand) between 1 and 80),
  line text not null check (char_length(line) between 1 and 180),
  details text not null default '' check (char_length(details) <= 240),
  bg text not null check (bg ~ '^#[0-9A-Fa-f]{6}$'),
  fg text not null check (fg ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.portfolio_posters enable row level security;

grant select on public.portfolio_posters to anon, authenticated;
grant insert, update, delete on public.portfolio_posters to authenticated;

drop policy if exists "Portfolio posters are publicly readable" on public.portfolio_posters;
create policy "Portfolio posters are publicly readable"
on public.portfolio_posters for select
to anon, authenticated
using (true);

drop policy if exists "Configured admin can add portfolio posters" on public.portfolio_posters;
create policy "Configured admin can add portfolio posters"
on public.portfolio_posters for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
);

drop policy if exists "Configured admin can edit portfolio posters" on public.portfolio_posters;
create policy "Configured admin can edit portfolio posters"
on public.portfolio_posters for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
);

drop policy if exists "Configured admin can delete portfolio posters" on public.portfolio_posters;
create policy "Configured admin can delete portfolio posters"
on public.portfolio_posters for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = lower('deoriankita2004@gmail.com')
);

create table if not exists public.portfolio_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (char_length(trim(email)) between 3 and 254),
  project_type text not null check (project_type in ('UGC', 'Social media management', 'Content creation', 'Other')),
  budget text not null check (budget in ('Not sure yet', 'Starter', 'Mid', 'Large')),
  project_description text not null check (char_length(trim(project_description)) between 10 and 2000),
  created_at timestamptz not null default now()
);

alter table public.portfolio_enquiries
  add column if not exists id uuid not null default gen_random_uuid(),
  add column if not exists name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists project_type text not null default 'Other',
  add column if not exists budget text not null default 'Not sure yet'
  check (budget in ('Not sure yet', 'Starter', 'Mid', 'Large')),
  add column if not exists project_description text not null default '',
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_enquiries'
      and column_name = 'details'
  ) then
    execute $migration$
      update public.portfolio_enquiries
      set project_description = details
      where project_description = '' and details <> ''
    $migration$;
  end if;
end
$$;

alter table public.portfolio_enquiries enable row level security;

revoke all on public.portfolio_enquiries from anon, authenticated;
grant insert on public.portfolio_enquiries to authenticated;

drop policy if exists "Visitors can submit portfolio enquiries" on public.portfolio_enquiries;
drop policy if exists "Verified users can submit portfolio enquiries" on public.portfolio_enquiries;
create policy "Verified users can submit portfolio enquiries"
on public.portfolio_enquiries for insert
to authenticated
with check (
  auth.uid() is not null
  and lower(trim(email)) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

notify pgrst, 'reload schema';
