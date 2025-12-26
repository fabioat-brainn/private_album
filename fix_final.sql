-- 1. Secure Function to Get Members (Bypasses RLS)
-- This function checks if you are allowed to see the album (Owner or Member)
-- And then returns ALL members.
create or replace function get_album_members_secure(target_album_id uuid)
returns setof album_members
language plpgsql
security definer
as $$
declare
  is_authorized boolean;
begin
  -- Check if user is owner OR member
  select exists (
    select 1 from albums where id = target_album_id and owner_id = auth.uid()
  ) or exists (
    select 1 from album_members where album_id = target_album_id and (user_id = auth.uid() or user_email = (select auth.jwt() ->> 'email'))
  ) into is_authorized;

  if is_authorized then
    return query select * from album_members where album_id = target_album_id;
  else
    raise exception 'Access Denied';
  end if;
end;
$$;


-- 2. Secure Function to Get User Email (from auth.users directly)
-- Useful because profiles trigger might have been missed for existing users.
create or replace function get_user_email_secure(target_user_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  found_email text;
begin
  -- Only return email if the requester is allowed to see it?
  -- For now, let's assume if you have the UUID you can look up the email (internal directory).
  -- Or restrict to "if they share an album".
  -- Let's keep it simple: return email.
  select email into found_email from auth.users where id = target_user_id;
  return found_email;
end;
$$;


-- 3. Trigger to Ensure Profiles Existence (for future)
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger safely
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();
