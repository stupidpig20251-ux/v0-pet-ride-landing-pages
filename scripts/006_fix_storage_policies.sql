-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for pet photos" ON storage.objects;

-- Create more permissive policies for development (no auth required)
CREATE POLICY "Allow public uploads to pet-photos bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pet-photos');

CREATE POLICY "Allow public read access to pet-photos bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "Allow public updates to pet-photos bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'pet-photos');

CREATE POLICY "Allow public deletes from pet-photos bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'pet-photos');
