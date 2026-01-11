-- Create storage bucket for case sheet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-sheet-images', 'case-sheet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view case sheet images (public bucket)
CREATE POLICY "Anyone can view case sheet images"
ON storage.objects FOR SELECT
USING (bucket_id = 'case-sheet-images');

-- Allow anyone to upload case sheet images
CREATE POLICY "Anyone can upload case sheet images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'case-sheet-images');

-- Allow anyone to delete case sheet images
CREATE POLICY "Anyone can delete case sheet images"
ON storage.objects FOR DELETE
USING (bucket_id = 'case-sheet-images');