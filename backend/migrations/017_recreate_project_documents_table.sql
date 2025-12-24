-- Recreate project_documents table with project_name as text
CREATE TABLE IF NOT EXISTS project_documents (
  id SERIAL PRIMARY KEY,
  project_name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  document_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure index on project_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_documents_project_name ON project_documents(project_name);

-- Ensure uniqueness of document_id within a project
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_project_document_id'
  ) THEN
    BEGIN
      ALTER TABLE project_documents ADD CONSTRAINT uniq_project_document_id UNIQUE (project_name, document_id);
    EXCEPTION WHEN duplicate_object THEN
      -- Constraint exists; ignore
      NULL;
    END;
  END IF;
END $$;
