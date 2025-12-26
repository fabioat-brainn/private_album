-- 1. Unblock Profile Visibility (so members can see Owner's email)
-- Currently, profiles might only be viewable by the user themselves.
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Profiles visible to self" on profiles;

create policy "Profiles viewable by authenticated users"
on profiles for select
to authenticated
using ( true );


-- 2. Unblock Member List Visibility (so members can see each other)
-- Currently, members can likely solely see their own row in album_members.
drop policy if exists "View self" on album_members;
drop policy if exists "View own membership" on album_members;

create policy "Members can view fellow members"
on album_members for select
using (
  -- You can see a row if you are a member of the album that row belongs to
  is_album_member(album_id) 
  OR
  -- Or if the row is ABOUT you (e.g. pending invite)
  user_email = (select auth.jwt() ->> 'email')
);
