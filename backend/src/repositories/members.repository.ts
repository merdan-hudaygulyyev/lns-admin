import { query } from "../config/database";
import type { Currency, MemberListFilters, MemberRow } from "../types";

export interface MemberInsert {
  username: string;
  password_hash: string;
  full_name: string;
  mother_name: string;
  heir: string;
  passport_number: string;
  passport_hash: string;
  birth_date: string;
  secret_question: string;
  secret_answer_hash: string;
  email: string;
  pin_code_hash: string;
  phone: string;
  inviter: string;
  product: string;
  address: string;
  postal_index: string;
  official_site: string;
  registration_date: string;
  amount: number;
  currency: Currency;
  image_path: string;
  image_paths: string[];
}

export type MemberPatch = Partial<MemberInsert>;

const sortColumns: Record<MemberListFilters["sortBy"], string> = {
  created_at: "created_at",
  full_name: "full_name",
  amount: "amount",
  registration_date: "registration_date",
};

const updateColumns: Record<keyof MemberInsert, string> = {
  username: "username",
  password_hash: "password_hash",
  full_name: "full_name",
  mother_name: "mother_name",
  heir: "heir",
  passport_number: "passport_number",
  passport_hash: "passport_hash",
  birth_date: "birth_date",
  secret_question: "secret_question",
  secret_answer_hash: "secret_answer_hash",
  email: "email",
  pin_code_hash: "pin_code_hash",
  phone: "phone",
  inviter: "inviter",
  product: "product",
  address: "address",
  postal_index: "postal_index",
  official_site: "official_site",
  registration_date: "registration_date",
  amount: "amount",
  currency: "currency",
  image_path: "image_path",
  image_paths: "image_paths",
};

function escapeLike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function buildWhere(filters: MemberListFilters): { clause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    const termIndex = params.push(`%${escapeLike(filters.search)}%`);
    const escape = "ESCAPE '\\'";
    const fields = ["username", "full_name", "email", "phone", "inviter", "product"];
    const ors = fields.map((field) => `${field} ILIKE $${termIndex} ${escape}`);
    if (filters.passportHash) {
      const hashIndex = params.push(filters.passportHash);
      ors.push(`passport_hash = $${hashIndex}`);
    }
    conditions.push(`(${ors.join(" OR ")})`);
  }

  if (filters.currency) {
    conditions.push(`currency = $${params.push(filters.currency)}`);
  }
  if (filters.product) {
    conditions.push(`LOWER(product) = LOWER($${params.push(filters.product)})`);
  }
  if (filters.inviter) {
    conditions.push(`LOWER(inviter) = LOWER($${params.push(filters.inviter)})`);
  }
  if (filters.amountMin !== undefined) {
    conditions.push(`amount >= $${params.push(filters.amountMin)}`);
  }
  if (filters.amountMax !== undefined) {
    conditions.push(`amount <= $${params.push(filters.amountMax)}`);
  }
  if (filters.registrationFrom) {
    conditions.push(`registration_date >= $${params.push(filters.registrationFrom)}::date`);
  }
  if (filters.registrationTo) {
    conditions.push(`registration_date <= $${params.push(filters.registrationTo)}::date`);
  }
  if (filters.birthFrom) {
    conditions.push(`birth_date >= $${params.push(filters.birthFrom)}::date`);
  }
  if (filters.birthTo) {
    conditions.push(`birth_date <= $${params.push(filters.birthTo)}::date`);
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export async function findMany(
  filters: MemberListFilters,
): Promise<{ rows: MemberRow[]; total: number }> {
  const { clause, params } = buildWhere(filters);
  const countResult = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM members ${clause}`,
    params,
  );
  const total = Number(countResult.rows[0]?.total ?? 0);

  const limitIndex = params.push(filters.limit);
  const offsetIndex = params.push((filters.page - 1) * filters.limit);
  const direction = filters.order === "asc" ? "ASC" : "DESC";

  const result = await query<MemberRow>(
    `SELECT * FROM members ${clause}
     ORDER BY ${sortColumns[filters.sortBy]} ${direction}, id ASC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params,
  );

  return { rows: result.rows, total };
}

export async function findById(id: string): Promise<MemberRow | undefined> {
  const result = await query<MemberRow>("SELECT * FROM members WHERE id = $1", [id]);
  return result.rows[0];
}

export async function create(data: MemberInsert): Promise<MemberRow> {
  const result = await query<MemberRow>(
    `INSERT INTO members (
       username, password_hash, full_name, mother_name, heir,
       passport_number, passport_hash, birth_date, secret_question,
       secret_answer_hash, email, pin_code_hash, phone, inviter, product,
       address, postal_index, official_site, registration_date, amount,
       currency, image_path, image_paths, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
       $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
     ) RETURNING *`,
    [
      data.username,
      data.password_hash,
      data.full_name,
      data.mother_name,
      data.heir,
      data.passport_number,
      data.passport_hash,
      data.birth_date,
      data.secret_question,
      data.secret_answer_hash,
      data.email,
      data.pin_code_hash,
      data.phone,
      data.inviter,
      data.product,
      data.address,
      data.postal_index,
      data.official_site,
      data.registration_date,
      data.amount,
      data.currency,
      data.image_path,
      data.image_paths,
    ],
  );
  return result.rows[0];
}

export async function update(id: string, patch: MemberPatch): Promise<MemberRow | undefined> {
  const entries = Object.entries(patch).filter(
    ([key, value]) => value !== undefined && key in updateColumns,
  ) as [keyof MemberInsert, unknown][];

  if (entries.length === 0) {
    return findById(id);
  }

  const params: unknown[] = [];
  const assignments = entries.map(([key, value]) => {
    params.push(value);
    return `${updateColumns[key]} = $${params.length}`;
  });

  params.push(id);
  const result = await query<MemberRow>(
    `UPDATE members SET ${assignments.join(", ")}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params,
  );
  return result.rows[0];
}

export async function remove(id: string): Promise<MemberRow | undefined> {
  const result = await query<MemberRow>("DELETE FROM members WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
}
