-- Rename column documnet_description to document_description on global_documents, or drop duplicate misspelled column if corrected one already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_documents' AND column_name = 'documnet_description'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'global_documents' AND column_name = 'document_description'
    ) THEN
      EXECUTE 'ALTER TABLE global_documents RENAME COLUMN documnet_description TO document_description';
    ELSE
      EXECUTE 'ALTER TABLE global_documents DROP COLUMN documnet_description';
    END IF;
  END IF;
END $$;
