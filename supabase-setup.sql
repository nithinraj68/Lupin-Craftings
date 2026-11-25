-- Lupin Craftings: run this ONCE in Supabase (SQL Editor > New query > paste > Run).
-- It creates the tables for customers, reviews and enquiries, and the rules about who can see what.

-- 1) Customers (filled automatically when someone signs up)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, email text, phone text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- 2) Admins (the emails allowed to approve reviews and see customer data)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

drop policy if exists "admin sees own row" on public.admins;
create policy "admin sees own row" on public.admins for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- copy name and phone from the sign-up form into profiles
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'phone')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Reviews (hidden until you approve them)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  name text not null,
  product text,
  rating int not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 1000),
  photos text[] not null default '{}',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;

drop policy if exists "read approved reviews" on public.reviews;
create policy "read approved reviews" on public.reviews for select
  using (approved = true or user_id = auth.uid() or public.is_admin());
drop policy if exists "logged in users add pending reviews" on public.reviews;
create policy "logged in users add pending reviews" on public.reviews for insert to authenticated
  with check (user_id = auth.uid() and approved = false and cardinality(photos) <= 3);
drop policy if exists "admin approves reviews" on public.reviews;
create policy "admin approves reviews" on public.reviews for update using (public.is_admin());
drop policy if exists "admin deletes reviews" on public.reviews;
create policy "admin deletes reviews" on public.reviews for delete using (public.is_admin());

-- 4) Enquiries sent from the Contact page (saved so you have a record)
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text not null, email text not null,
  interest text, vehicle text, message text, channel text,
  created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
drop policy if exists "anyone can send an enquiry" on public.enquiries;
create policy "anyone can send an enquiry" on public.enquiries for insert to anon, authenticated
  with check (char_length(name) between 2 and 120 and char_length(phone) between 7 and 30 and char_length(email) between 5 and 200);
drop policy if exists "admin reads enquiries" on public.enquiries;
create policy "admin reads enquiries" on public.enquiries for select using (public.is_admin());
drop policy if exists "admin deletes enquiries" on public.enquiries;
create policy "admin deletes enquiries" on public.enquiries for delete using (public.is_admin());

-- 5) Photo storage for reviews (max 3 MB per photo, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone can view review photos" on storage.objects;
create policy "anyone can view review photos" on storage.objects for select using (bucket_id = 'review-photos');
drop policy if exists "users upload to own folder" on storage.objects;
create policy "users upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "admin deletes review photos" on storage.objects;
create policy "admin deletes review photos" on storage.objects for delete
  using (bucket_id = 'review-photos' and public.is_admin());

-- 6) LAST STEP: make yourself an admin. Replace the email with the one you will log in with:
-- insert into public.admins (email) values ('Lupincraftings@gmail.com');
