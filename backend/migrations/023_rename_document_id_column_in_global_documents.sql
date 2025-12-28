-- Drop document_id column from global_documents table (if it exists)
ALTER TABLE global_documents 
DROP COLUMN IF EXISTS document_id;
