-- Rename document_id column to document_iname in project_documents table
ALTER TABLE project_documents 
RENAME COLUMN document_id TO document_iname;
