-- Add project_name to project_tags for per-project values
ALTER TABLE project_tags
ADD COLUMN IF NOT EXISTS project_name TEXT;

-- Optional: speed lookups by project/tag name
CREATE INDEX IF NOT EXISTS idx_project_tags_project_name
  ON project_tags (project_name);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_name_tag_name
  ON project_tags (project_name, tag_name);
