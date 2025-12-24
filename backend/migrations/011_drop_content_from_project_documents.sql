-- Drop content column from project_documents table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_documents' AND column_name = 'content'
  ) THEN
    ALTER TABLE project_documents DROP COLUMN content;
  END IF;
END $$;
