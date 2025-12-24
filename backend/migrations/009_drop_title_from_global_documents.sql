-- Drop title column from global_documents table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_documents' AND column_name = 'title'
  ) THEN
    ALTER TABLE global_documents DROP COLUMN title;
  END IF;
END $$;
