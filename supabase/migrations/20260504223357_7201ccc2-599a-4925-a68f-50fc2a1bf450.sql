UPDATE storage.buckets SET public = false WHERE id IN ('patient-images', 'case-sheet-images');

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (policyname ILIKE '%patient%image%' OR policyname ILIKE '%case sheet%' OR policyname ILIKE '%case-sheet%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;