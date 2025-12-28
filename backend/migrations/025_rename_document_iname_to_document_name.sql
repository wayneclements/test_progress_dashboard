-- Rename document_iname column to document_name in project_documents table
ALTER TABLE project_documents 
RENAME COLUMN document_iname TO document_name;
