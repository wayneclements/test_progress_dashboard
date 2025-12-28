-- Add document_name column to document_tags table
ALTER TABLE document_tags 
ADD COLUMN IF NOT EXISTS document_name VARCHAR;
