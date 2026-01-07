-- Create states table
DROP TABLE IF EXISTS states CASCADE;
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create cities table
DROP TABLE IF EXISTS cities CASCADE;
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state_id INTEGER REFERENCES states(id),
  UNIQUE(name, state_id)
);

-- Add state_id and city_id columns to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS state_id INTEGER REFERENCES states(id);
ALTER TABLE media ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id);

-- Create a temporary table for the CSV data
CREATE TEMP TABLE temp_media_clean (
  id UUID,
  city TEXT,
  state TEXT
);

-- Import CSV data (this will be done via COPY command)
\COPY temp_media_clean FROM '/Users/yashsolanki/Downloads/media_export_clean.csv' WITH CSV HEADER;

-- Populate states table with unique states
INSERT INTO states (name)
SELECT DISTINCT state
FROM temp_media_clean
WHERE state IS NOT NULL AND state != ''
ON CONFLICT (name) DO NOTHING;

-- Populate cities table with unique cities and their states
INSERT INTO cities (name, state_id)
SELECT DISTINCT t.city, s.id
FROM temp_media_clean t
INNER JOIN states s ON s.name = t.state
WHERE t.city IS NOT NULL AND t.city != ''
ON CONFLICT (name, state_id) DO NOTHING;

-- Update media table with state_id
UPDATE media m
SET state_id = s.id
FROM temp_media_clean t
INNER JOIN states s ON s.name = t.state
WHERE m.id = t.id;

-- Update media table with city_id
UPDATE media m
SET city_id = c.id
FROM temp_media_clean t
INNER JOIN states s ON s.name = t.state
INNER JOIN cities c ON c.name = t.city AND c.state_id = s.id
WHERE m.id = t.id;

-- Show summary
SELECT 'States created:' as info, COUNT(*) as count FROM states
UNION ALL
SELECT 'Cities created:' as info, COUNT(*) as count FROM cities
UNION ALL
SELECT 'Media records updated with state_id:' as info, COUNT(*) as count FROM media WHERE state_id IS NOT NULL
UNION ALL
SELECT 'Media records updated with city_id:' as info, COUNT(*) as count FROM media WHERE city_id IS NOT NULL;
