-- Secure RPC to check if an email is already registered
-- WARNING: This allows email enumeration. Allowable for this private app.

create or replace function check_email_exists(target_email text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from auth.users where email = target_email
  );
end;
$$;
