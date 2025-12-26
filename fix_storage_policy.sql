-- Enable RLS on storage.objects (usually enabled by default, but good to ensure)
-- Note: You must have created the 'photos' bucket in the Supabase Dashboard first!
-- If you haven't, go to Storage -> Create new bucket -> 'photos' (Public or Private, Private is fine if we use signed URLs or authenticated download, but we are using publicUrl so strict RLS is tricky. Let's assume Public Bucket or we use GetPublicUrl which works on private buckets if RLS allows select).

-- 1. Allow Uploads (Insert) for Authenticated Users
create policy "Allow authenticated uploads"
on storage.objects for insert
with check (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 2. Allow Viewing (Select) for Authenticated Users
create policy "Allow authenticated downloads"
on storage.objects for select
using (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 3. Allow Updates/Deletes (Optional, for members removing their own photos?)
create policy "Allow authenticated updates"
on storage.objects for update
using (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

create policy "Allow authenticated deletes"
on storage.objects for delete
using (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);
