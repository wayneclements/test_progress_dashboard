-- Create project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  document_id TEXT NOT NULL,
  document_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);

-- Ensure uniqueness of document_id within a project
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_project_document_id'
  ) THEN
    BEGIN
      ALTER TABLE project_documents ADD CONSTRAINT uniq_project_document_id UNIQUE (project_id, document_id);
    EXCEPTION WHEN duplicate_object THEN
      -- Constraint exists; ignore
      NULL;
    END;
  END IF;
END $$;
