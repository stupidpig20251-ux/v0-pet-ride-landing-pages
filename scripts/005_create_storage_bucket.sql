-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pet-photos', 'pet-photos', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read access for pet photos" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-photos');
