-- Drop title column from project_documents table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_documents' AND column_name = 'title'
  ) THEN
    ALTER TABLE project_documents DROP COLUMN title;
  END IF;
END $$;
