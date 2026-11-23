import { query } from "../config/database";
import type { AdminDto, AdminRole, AdminRow } from "../types";

export function toAdminDto(row: AdminRow): AdminDto {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  };
}

export async function findAdminByLogin(login: string): Promise<AdminRow | undefined> {
  const result = await query<AdminRow>(
    "SELECT * FROM admins WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1",
    [login],
  );
  return result.rows[0];
}

export async function findAdminById(id: string): Promise<AdminRow | undefined> {
  const result = await query<AdminRow>("SELECT * FROM admins WHERE id = $1", [id]);
  return result.rows[0];
}

export async function listAdmins(): Promise<AdminRow[]> {
  const result = await query<AdminRow>(
    "SELECT * FROM admins ORDER BY created_at DESC, username ASC",
  );
  return result.rows;
}

/** Keeps the bootstrap account as the only super administrator. */
export async function demoteOtherSuperAdmins(email: string): Promise<void> {
  await query(
    `UPDATE admins
     SET role = 'admin', updated_at = NOW()
     WHERE role = 'super_admin' AND LOWER(email) <> LOWER($1)`,
    [email],
  );
}

interface AdminInput {
  email: string;
  username: string;
  passwordHash: string;
  role: AdminRole;
}

export async function createAdmin(input: AdminInput): Promise<AdminRow> {
  const result = await query<AdminRow>(
    `INSERT INTO admins (email, username, password_hash, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [input.email, input.username, input.passwordHash, input.role],
  );
  return result.rows[0];
}

export async function upsertAdmin(input: AdminInput): Promise<AdminRow> {
  const result = await query<AdminRow>(
    `INSERT INTO admins (email, username, password_hash, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           updated_at = NOW()
     RETURNING *`,
    [input.email, input.username, input.passwordHash, input.role],
  );
  return result.rows[0];
}
