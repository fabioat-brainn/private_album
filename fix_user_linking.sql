-- 1. Function to handle New User Signup
-- When a new user signs up, look for any pending invites (NULL user_id) with their email and link them.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  update public.album_members
  set user_id = new.id
  where user_email = new.email;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: After Insert on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- 2. Improved "Add Member" Logic (Optional but recommended)
-- Instead of just inserting, we can try to find the ID if they already exist.
-- But client can't see auth.users.
-- We can make a function for it.
create or replace function add_album_member(target_album_id uuid, target_email text)
returns json as $$
declare
  target_user_id uuid;
begin
  -- 1. Check if user exists in auth.users (requires security definer)
  select id into target_user_id
  from auth.users
  where email = target_email;

  -- 2. Insert with ID if found, else just Email
  insert into public.album_members (album_id, user_id, user_email)
  values (target_album_id, target_user_id, target_email);
  
  return json_build_object('user_id', target_user_id, 'email', target_email);
end;
$$ language plpgsql security definer;
-- Note: You'd need to update albumService to call this RPC instead of direct insert if you want immediate linking for existing users.
-- BUT, strictly speaking, the Trigger above handles NEW users.
-- For EXISTING users who are invited, we need a way to link them.
-- The Trigger only fires on INSERT.
-- So we DO need this function to search for existing users.

-- Let's expose this function to the API.
