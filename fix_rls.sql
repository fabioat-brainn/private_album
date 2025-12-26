-- DROP EXISTING POLICIES TO AVOID CONFLICTS
drop policy if exists "Members visibility" on album_members;
drop policy if exists "Albums viewable by members" on albums;
drop policy if exists "Photos viewable by album members" on photos;
drop policy if exists "Photos insertable by album members" on photos;

-- 1. ALBUM MEMBERS (Break the recursion by simplifying)
-- Users can ALWAYS see their own membership row.
create policy "View own membership" on album_members for select
using ( user_id = auth.uid() );

-- Album Owners can see ALL members of their albums.
create policy "Owner views members" on album_members for select
using (
  exists (
    select 1 from albums
    where albums.id = album_members.album_id
    and albums.owner_id = auth.uid()
  )
);

-- Users can join (insert themselves) directly? No, usually invited.
-- But for "Add Member" via email, we insert.
-- Allow insert if you are the Owner of the album.
create policy "Owner manages members" on album_members for insert
with check (
  exists (
    select 1 from albums
    where albums.id = album_members.album_id
    and albums.owner_id = auth.uid()
  )
);
-- Also allow delete
create policy "Owner removes members" on album_members for delete
using (
  exists (
    select 1 from albums
    where albums.id = album_members.album_id
    and albums.owner_id = auth.uid()
  )
);


-- 2. ALBUMS (Now safe to query album_members because 'View own membership' exists)
create policy "Albums viewable by members" on albums for select
using (
  owner_id = auth.uid()
  or
  exists (
    select 1 from album_members
    where album_members.album_id = albums.id
    and album_members.user_id = auth.uid()
  )
);

-- 3. PHOTOS (Depends on Albums/Members)
create policy "Photos viewable by album members" on photos for select
using (
  exists (
    select 1 from albums
    where albums.id = photos.album_id
    and (
      albums.owner_id = auth.uid()
      or
      exists (
         select 1 from album_members
         where album_members.album_id = albums.id
         and album_members.user_id = auth.uid()
      )
    )
  )
);

create policy "Photos insertable by album members" on photos for insert
with check (
  exists (
    select 1 from albums
    where albums.id = photos.album_id
    and (
      albums.owner_id = auth.uid()
      or
      exists (
         select 1 from album_members
         where album_members.album_id = albums.id
         and album_members.user_id = auth.uid()
      )
    )
  )
);
