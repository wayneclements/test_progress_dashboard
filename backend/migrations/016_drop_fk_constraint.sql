-- Drop foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'project_documents' AND constraint_name = 'project_documents_project_id_fkey'
  ) THEN
    ALTER TABLE project_documents DROP CONSTRAINT project_documents_project_id_fkey;
  END IF;
END $$;
