-- Drop foreign key constraint and change project_name column type from integer to text in project_documents table
DO $$
BEGIN
  -- Drop FK constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'project_documents' AND constraint_name = 'project_documents_project_id_fkey'
  ) THEN
    ALTER TABLE project_documents DROP CONSTRAINT project_documents_project_id_fkey;
  END IF;
  
  -- Change column type from integer to text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_documents' AND column_name = 'project_name' AND data_type = 'integer'
  ) THEN
    ALTER TABLE project_documents ALTER COLUMN project_name TYPE text;
  END IF;
END $$;
