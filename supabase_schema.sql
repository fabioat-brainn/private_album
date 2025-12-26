-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Public user data)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- 2. ALBUMS
create table albums (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  owner_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  cover_url text -- Optional custom cover
);

-- 3. ALBUM_MEMBERS (Junction for permissions)
create table album_members (
  id uuid default uuid_generate_v4() primary key,
  album_id uuid references albums on delete cascade not null,
  user_email text not null, -- easy way to invite before they exist, or link to profiles
  user_id uuid references auth.users, -- can be null if pending invite
  role text check (role in ('owner', 'member')) default 'member',
  added_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. PHOTOS
create table photos (
  id uuid default uuid_generate_v4() primary key,
  album_id uuid references albums on delete cascade not null,
  user_id uuid references auth.users not null, -- uploaded by
  url text not null,
  storage_path text not null, -- for deletion
  taken_at timestamp with time zone, -- extracted metadata
  width int, -- basic metadata for layout
  height int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RLS) POLICIES

alter table profiles enable row level security;
alter table albums enable row level security;
alter table album_members enable row level security;
alter table photos enable row level security;

-- Profiles: Readable by everyone (for sharing), Editable by self
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Albums: Viewable if you are the owner OR a member
create policy "Albums viewable by members" on albums for select
using (
  auth.uid() = owner_id or
  exists (
    select 1 from album_members
    where album_members.album_id = albums.id
    and album_members.user_id = auth.uid()
  )
);

-- Albums: Insertable only by authenticated users (becomes owner)
create policy "Users can create albums" on albums for insert
with check (auth.role() = 'authenticated');

-- Album Members: Viewable by members of that album
create policy "Members visibility" on album_members for select
using (
  exists (
    select 1 from album_members am
    where am.album_id = album_members.album_id
    and am.user_id = auth.uid()
  )
  or
  exists (
    select 1 from albums
    where albums.id = album_members.album_id
    and albums.owner_id = auth.uid()
  )
);

-- Photos: Viewable if member of album
create policy "Photos viewable by album members" on photos for select
using (
  exists (
    select 1 from album_members
    where album_members.album_id = photos.album_id
    and album_members.user_id = auth.uid()
  )
  or
  exists (
    select 1 from albums
    where albums.id = photos.album_id
    and albums.owner_id = auth.uid()
  )
);

-- Photos: Insertable if member
create policy "Photos insertable by album members" on photos for insert
with check (
   exists (
    select 1 from album_members
    where album_members.album_id = photos.album_id
    and album_members.user_id = auth.uid()
  )
  or
  exists (
    select 1 from albums
    where albums.id = photos.album_id
    and albums.owner_id = auth.uid()
  )
);

-- STORAGE POLICIES (Buckets)
-- You need to create a bucket named 'photos' in Supabase Storage.
-- Policy: "Give access to authenticated users" (broad) or stricter based on RLS logic (harder with storage).
-- Simple: Authenticated users can select/insert.
