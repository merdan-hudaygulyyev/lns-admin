import * as adminsRepository from "../repositories/admins.repository";
import type { CreateAdminInput } from "../schemas/admins.schema";
import type { AdminDto } from "../types";
import { AppError } from "../utils/AppError";
import { hashPassword } from "./auth.service";

export async function listAdmins(): Promise<AdminDto[]> {
  const admins = await adminsRepository.listAdmins();
  return admins.map(adminsRepository.toAdminDto);
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminDto> {
  const usernameTaken = await adminsRepository.findAdminByLogin(input.username);
  if (usernameTaken) {
    throw AppError.conflict("Username already in use", { username: "Already in use" });
  }

  const emailTaken = await adminsRepository.findAdminByLogin(input.email);
  if (emailTaken) {
    throw AppError.conflict("Email already in use", { email: "Already in use" });
  }

  const admin = await adminsRepository.createAdmin({
    email: input.email,
    username: input.username,
    passwordHash: await hashPassword(input.password),
    role: "admin",
  });

  return adminsRepository.toAdminDto(admin);
}
