-- DROP ALL PREVIOUS POLICIES TO START FRESH
drop policy if exists "Members visibility" on album_members;
drop policy if exists "View own membership" on album_members;
drop policy if exists "Owner views members" on album_members;
drop policy if exists "Owner manages members" on album_members;
drop policy if exists "Owner removes members" on album_members;
drop policy if exists "Owner select members" on album_members;
drop policy if exists "Owner insert members" on album_members;
drop policy if exists "Owner delete members" on album_members;
drop policy if exists "Owner update members" on album_members;
drop policy if exists "View self" on album_members;

drop policy if exists "Albums viewable by members" on albums;
drop policy if exists "Albums viewable" on albums;

drop policy if exists "Photos viewable by album members" on photos;
drop policy if exists "Photos viewable" on photos;
drop policy if exists "Photos insertable by album members" on photos;
drop policy if exists "Photos insertable" on photos;

-- 1. SECURITY DEFINER FUNCTION
-- This allows us to check membership WITHOUT triggering the RLS on album_members recurisvely.
create or replace function is_album_member(_album_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from album_members
    where album_id = _album_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 2. ALBUMS POLICY
create policy "Albums viewable" on albums for select
using (
  owner_id = auth.uid()
  or
  is_album_member(id)
);

-- 3. ALBUM_MEMBERS POLICIES
-- A. I can see my own row
create policy "View self" on album_members for select
using ( user_id = auth.uid() );

-- B. Owner can see/manage all members of their albums
create policy "Owner select members" on album_members for select
using (
  exists ( select 1 from albums where id = album_members.album_id and owner_id = auth.uid() )
);

create policy "Owner insert members" on album_members for insert
with check (
  exists ( select 1 from albums where id = album_members.album_id and owner_id = auth.uid() )
);

create policy "Owner delete members" on album_members for delete
using (
  exists ( select 1 from albums where id = album_members.album_id and owner_id = auth.uid() )
);

-- 4. PHOTOS POLICIES
create policy "Photos viewable" on photos for select
using (
  exists (
    select 1 from albums
    where id = photos.album_id
    and (
      owner_id = auth.uid()
      or is_album_member(id)
    )
  )
);

create policy "Photos insertable" on photos for insert
with check (
  exists (
    select 1 from albums
    where id = photos.album_id
    and (
      owner_id = auth.uid()
      or is_album_member(id)
    )
  )
);
