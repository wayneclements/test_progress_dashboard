-- Rename column documnet_id to document_id on global_documents, or drop duplicate misspelled column if corrected one already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_documents' AND column_name = 'documnet_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'global_documents' AND column_name = 'document_id'
    ) THEN
      EXECUTE 'ALTER TABLE global_documents RENAME COLUMN documnet_id TO document_id';
    ELSE
      EXECUTE 'ALTER TABLE global_documents DROP COLUMN documnet_id';
    END IF;
  END IF;
END $$;
