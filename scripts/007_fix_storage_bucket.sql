-- Ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('pet-photos', 'pet-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public uploads to pet-photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to pet-photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to pet-photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from pet-photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for pet photos" ON storage.objects;

-- Create simple, permissive policies for development
CREATE POLICY "Enable all operations for pet-photos bucket" ON storage.objects
FOR ALL USING (bucket_id = 'pet-photos');
