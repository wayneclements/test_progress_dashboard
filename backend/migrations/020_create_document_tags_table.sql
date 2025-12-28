-- Create document_tags table
CREATE TABLE IF NOT EXISTS document_tags (
  id SERIAL PRIMARY KEY,
  tag_name VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
