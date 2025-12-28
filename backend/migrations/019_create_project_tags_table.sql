-- Create project_tags table
CREATE TABLE IF NOT EXISTS project_tags (
  id SERIAL PRIMARY KEY,
  tag_name VARCHAR,
  tag_value VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
