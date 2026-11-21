-- Ordered gallery support. Keep image_path as the first-image thumbnail so
-- existing list views and older API clients continue to work unchanged.

ALTER TABLE members
    ADD COLUMN IF NOT EXISTS image_paths TEXT[] NOT NULL DEFAULT '{}';

UPDATE members
SET image_paths = ARRAY[image_path]::text[]
WHERE cardinality(image_paths) = 0
  AND image_path IS NOT NULL
  AND image_path <> '';
