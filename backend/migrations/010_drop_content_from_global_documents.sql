-- Drop content column from global_documents table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_documents' AND column_name = 'content'
  ) THEN
    ALTER TABLE global_documents DROP COLUMN content;
  END IF;
END $$;
