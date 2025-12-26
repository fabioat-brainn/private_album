-- Add unique constraint to avoid duplicate members by email in the same album
alter table album_members
add constraint album_members_album_id_user_email_key unique (album_id, user_email);
