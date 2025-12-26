-- 1. Add username to Profiles
alter table profiles 
add column if not exists username text;

-- 2. Create Photo Comments table
create table if not exists photo_comments (
  id uuid default uuid_generate_v4() primary key,
  photo_id uuid references photos(id) on delete cascade not null,
  user_id uuid references auth.users not null, -- Author
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. RLS for Photo Comments
alter table photo_comments enable row level security;

-- View: Members of the album can view comments
create policy "Members can view comments"
on photo_comments for select
using (
  exists (
    select 1 from photos
    join album_members on album_members.album_id = photos.album_id
    where photos.id = photo_comments.photo_id
    and album_members.user_id = auth.uid()
  )
  or
  exists (
    select 1 from photos
    join albums on albums.id = photos.album_id
    where photos.id = photo_comments.photo_id
    and albums.owner_id = auth.uid()
  )
);

-- Insert: Members of the album can add comments
create policy "Members can add comments"
on photo_comments for insert
with check (
  exists (
    select 1 from photos
    join album_members on album_members.album_id = photos.album_id
    where photos.id = photo_comments.photo_id
    and album_members.user_id = auth.uid()
  )
  or
  exists (
    select 1 from photos
    join albums on albums.id = photos.album_id
    where photos.id = photo_comments.photo_id
    and albums.owner_id = auth.uid()
  )
);

-- 4. Helper to get username safely (or fallback to email)
create or replace function get_username(target_user_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  u_name text;
begin
  select username into u_name from profiles where id = target_user_id;
  if u_name is null then
     select split_part(email, '@', 1) into u_name from auth.users where id = target_user_id;
  end if;
  return u_name;
end;
$$;
