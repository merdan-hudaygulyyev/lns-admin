import { query } from "../config/database";
import type { AdminDto, AdminRow } from "../types";

export function toAdminDto(row: AdminRow): AdminDto {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
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

export async function upsertAdmin(input: {
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
}): Promise<AdminRow> {
  const result = await query<AdminRow>(
    `INSERT INTO admins (email, username, password_hash, full_name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           updated_at = NOW()
     RETURNING *`,
    [input.email, input.username, input.passwordHash, input.fullName],
  );
  return result.rows[0];
}
