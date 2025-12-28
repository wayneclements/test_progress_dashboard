-- Copy all global_documents rows to project_documents for each project
INSERT INTO project_documents (project_name, document_id, document_description)
SELECT p.name, gd.document_name, gd.document_description
FROM projects p
CROSS JOIN global_documents gd
ON CONFLICT (project_name, document_id) DO NOTHING;
