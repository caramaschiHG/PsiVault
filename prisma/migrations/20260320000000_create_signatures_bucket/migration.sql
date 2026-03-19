-- Criar bucket de assinaturas (idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para storage.objects
DO $$
BEGIN
  -- Upload
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'signatures_insert'
  ) THEN
    CREATE POLICY "signatures_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Leitura
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'signatures_select'
  ) THEN
    CREATE POLICY "signatures_select" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'signatures_delete'
  ) THEN
    CREATE POLICY "signatures_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
