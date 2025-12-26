-- Revoke previous lax delete policy
drop policy if exists "Members can delete photos" on photos;

-- Create strict owner-only delete policy
create policy "Only owner can delete photos"
on photos for delete
using (
  exists (
    select 1 from albums
    where albums.id = photos.album_id
    and albums.owner_id = auth.uid()
  )
);
