-- FIX 1: UPDATE is_album_member to check email from JWT
-- This allows invited users (whose user_id is NULL in table) to still see the album if their email matches.

create or replace function is_album_member(_album_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from album_members
    where album_id = _album_id
    and (
      user_id = auth.uid() -- Matched by ID (if claimed)
      or
      user_email = (select auth.jwt() ->> 'email') -- Matched by Email (if invited)
    )
  );
end;
$$ language plpgsql security definer;

-- FIX 2: TRIGGER to claim user_id on login/insert?
-- It's complex to auto-update existing rows.
-- But the visibility check above solves the immediate "Can I see it?" problem.

-- Also update 'View self' policy to allow seeing your own invite row by email
drop policy if exists "View self" on album_members;
create policy "View self" on album_members for select
using (
  user_id = auth.uid()
  or
  user_email = (select auth.jwt() ->> 'email')
);
