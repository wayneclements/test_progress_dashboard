-- Rename project_id column to project_name in project_documents table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_documents' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE project_documents RENAME COLUMN project_id TO project_name;
  END IF;
END $$;
