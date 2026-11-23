-- Keep exactly one super administrator and drop the unused display name.
-- The seed script later makes sure the configured ADMIN_EMAIL is that account.
UPDATE admins
SET role = 'admin'
WHERE role = 'super_admin'
  AND id <> (SELECT id FROM admins ORDER BY created_at ASC, username ASC LIMIT 1);

ALTER TABLE admins DROP COLUMN IF EXISTS full_name;

CREATE UNIQUE INDEX IF NOT EXISTS admins_one_super_admin
  ON admins (role) WHERE role = 'super_admin';
