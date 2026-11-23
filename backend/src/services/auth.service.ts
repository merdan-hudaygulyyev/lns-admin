import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import * as adminsRepository from "../repositories/admins.repository";
import type { AdminDto, AdminRow } from "../types";
import { AppError } from "../utils/AppError";

export interface LoginResult {
  token: string;
  admin: AdminDto;
}

/** JWT carries id and role; the database still decides the role on every request. */
export function signAccessToken(admin: Pick<AdminDto, "id" | "role">): string {
  return jwt.sign({ sub: admin.id, role: admin.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const admin = await adminsRepository.findAdminByLogin(username);
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    // Same message for both cases: do not disclose which accounts exist.
    throw AppError.unauthorized("Invalid username or password");
  }
  return {
    token: signAccessToken(admin),
    admin: adminsRepository.toAdminDto(admin),
  };
}

export async function getProfile(adminId: string): Promise<AdminDto> {
  const admin = await adminsRepository.findAdminById(adminId);
  if (!admin) throw AppError.unauthorized("Admin account no longer exists");
  return adminsRepository.toAdminDto(admin);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

export function toProfile(row: AdminRow): AdminDto {
  return adminsRepository.toAdminDto(row);
}
