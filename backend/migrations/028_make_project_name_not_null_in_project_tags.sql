-- Delete orphaned project_tags with null project_name (created before migration 027)
DELETE FROM project_tags WHERE project_name IS NULL;

-- Make project_name NOT NULL
ALTER TABLE project_tags
ALTER COLUMN project_name SET NOT NULL;
