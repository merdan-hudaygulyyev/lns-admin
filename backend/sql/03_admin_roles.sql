-- Administrator roles. Existing installations keep their first admin as the
-- bootstrap super administrator so admin management remains available.
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'admin';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admins_role_check'
  ) THEN
    ALTER TABLE admins
      ADD CONSTRAINT admins_role_check CHECK (role IN ('super_admin', 'admin'));
  END IF;
END
$$;

UPDATE admins
SET role = 'super_admin'
WHERE id = (SELECT id FROM admins ORDER BY created_at ASC LIMIT 1);
