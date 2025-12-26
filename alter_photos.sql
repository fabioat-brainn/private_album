-- Add description column to photos
alter table photos 
add column if not exists description text;

-- Allow members to update photos (for adding descriptions)
create policy "Members can update photos"
on photos for update
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

-- Allow members to delete photos (if they can insert, they should be able to delete? Or only their own?)
-- User requirement: "remove photos". Let's assume generic member access for now, or at least the uploader/owner.
-- Existing RLS might not cover delete.
create policy "Members can delete photos"
on photos for delete
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
