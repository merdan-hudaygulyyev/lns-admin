import bcrypt from "bcrypt";
import { env } from "../config/env";
import * as membersRepository from "../repositories/members.repository";
import type {
  MemberDto,
  MemberListFilters,
  MemberRow,
  PaginationMeta,
  UpdateMemberInput,
} from "../types";
import type { CreateMemberInput } from "../types";
import { AppError } from "../utils/AppError";
import { blindIndexPassport, decryptPassport, encryptPassport, maskPassport } from "../utils/crypto";
import * as imageService from "./image.service";

function toDateString(value: string | Date): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

/** Hashes are stripped here: this is the single serialization boundary for members. */
export function toMemberDto(row: MemberRow, revealPassport = false): MemberDto {
  const passport = decryptPassport(row.passport_number);
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    motherName: row.mother_name,
    heir: row.heir,
    passportNumber: revealPassport ? passport : maskPassport(passport),
    birthDate: toDateString(row.birth_date),
    secretQuestion: row.secret_question,
    email: row.email,
    phone: row.phone,
    inviter: row.inviter,
    product: row.product,
    address: row.address,
    postalIndex: row.postal_index,
    officialSite: row.official_site,
    registrationDate: toDateString(row.registration_date),
    amount: Number(row.amount),
    currency: row.currency,
    imagePath: imageService.imageUrl(row.image_path),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function translateDbError(error: unknown): never {
  const dbError = error as { code?: string; constraint?: string };
  if (dbError.code === "23505") {
    const field = dbError.constraint?.includes("username")
      ? "username"
      : dbError.constraint?.includes("email")
        ? "email"
        : "username";
    throw AppError.conflict("Username or email already exists", {
      [field]: `${field} is already in use`,
    });
  }
  throw error;
}

export async function create(
  input: CreateMemberInput,
  imageFile: Express.Multer.File,
): Promise<MemberDto> {
  const [passwordHash, pinHash, answerHash] = await Promise.all([
    bcrypt.hash(input.password, env.BCRYPT_ROUNDS),
    bcrypt.hash(input.pinCode, env.BCRYPT_ROUNDS),
    bcrypt.hash(input.secretAnswer, env.BCRYPT_ROUNDS),
  ]);

  const imagePath = await imageService.storeMemberImage(imageFile);

  try {
    const row = await membersRepository.create({
      username: input.username,
      password_hash: passwordHash,
      full_name: input.fullName,
      mother_name: input.motherName,
      heir: input.heir,
      passport_number: encryptPassport(input.passportNumber),
      passport_hash: blindIndexPassport(input.passportNumber),
      birth_date: input.birthDate,
      secret_question: input.secretQuestion,
      secret_answer_hash: answerHash,
      email: input.email.toLowerCase(),
      pin_code_hash: pinHash,
      phone: input.phone,
      inviter: input.inviter,
      product: input.product,
      address: input.address,
      postal_index: input.postalIndex,
      official_site: input.officialSite,
      registration_date: input.registrationDate,
      amount: input.amount,
      currency: input.currency,
      image_path: imagePath,
    });
    return toMemberDto(row);
  } catch (error) {
    // Do not leave orphan files behind when the insert fails.
    await imageService.deleteMemberImage(imagePath);
    translateDbError(error);
  }
}

export async function list(
  filters: MemberListFilters,
): Promise<{ data: MemberDto[]; meta: PaginationMeta }> {
  const passportHash =
    filters.search && filters.search.trim().length >= 3
      ? blindIndexPassport(filters.search)
      : undefined;

  const { rows, total } = await membersRepository.findMany({ ...filters, passportHash });
  return {
    data: rows.map((row) => toMemberDto(row, false)),
    meta: {
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  };
}

export async function getById(id: string): Promise<MemberDto> {
  const row = await membersRepository.findById(id);
  if (!row) throw AppError.notFound("Member not found");
  return toMemberDto(row, true);
}

const plainFieldMap: Partial<Record<keyof UpdateMemberInput, keyof membersRepository.MemberInsert>> = {
  username: "username",
  fullName: "full_name",
  motherName: "mother_name",
  heir: "heir",
  birthDate: "birth_date",
  secretQuestion: "secret_question",
  email: "email",
  phone: "phone",
  inviter: "inviter",
  product: "product",
  address: "address",
  postalIndex: "postal_index",
  officialSite: "official_site",
  registrationDate: "registration_date",
  amount: "amount",
  currency: "currency",
};

export async function update(
  id: string,
  input: UpdateMemberInput,
  imageFile?: Express.Multer.File,
): Promise<MemberDto> {
  const existing = await membersRepository.findById(id);
  if (!existing) throw AppError.notFound("Member not found");

  const patch: membersRepository.MemberPatch = {};
  for (const [key, column] of Object.entries(plainFieldMap)) {
    const value = input[key as keyof UpdateMemberInput];
    if (value !== undefined && column) {
      (patch as Record<string, unknown>)[column] = value;
    }
  }

  if (input.email !== undefined) patch.email = input.email.toLowerCase();

  const secretJobs: Promise<string>[] = [];
  if (input.password !== undefined) secretJobs.push(bcrypt.hash(input.password, env.BCRYPT_ROUNDS));
  if (input.pinCode !== undefined) secretJobs.push(bcrypt.hash(input.pinCode, env.BCRYPT_ROUNDS));
  if (input.secretAnswer !== undefined) {
    secretJobs.push(bcrypt.hash(input.secretAnswer, env.BCRYPT_ROUNDS));
  }
  const hashes = await Promise.all(secretJobs);
  let hashCursor = 0;
  if (input.password !== undefined) patch.password_hash = hashes[hashCursor++];
  if (input.pinCode !== undefined) patch.pin_code_hash = hashes[hashCursor++];
  if (input.secretAnswer !== undefined) patch.secret_answer_hash = hashes[hashCursor++];

  if (input.passportNumber !== undefined) {
    patch.passport_number = encryptPassport(input.passportNumber);
    patch.passport_hash = blindIndexPassport(input.passportNumber);
  }

  let newImagePath: string | undefined;
  if (imageFile) {
    newImagePath = await imageService.storeMemberImage(imageFile);
    patch.image_path = newImagePath;
  }

  try {
    const row = await membersRepository.update(id, patch);
    if (!row) throw AppError.notFound("Member not found");
    if (newImagePath) await imageService.deleteMemberImage(existing.image_path);
    return toMemberDto(row, true);
  } catch (error) {
    if (newImagePath) await imageService.deleteMemberImage(newImagePath);
    translateDbError(error);
  }
}

export async function remove(id: string): Promise<void> {
  const row = await membersRepository.findById(id);
  if (!row) throw AppError.notFound("Member not found");
  await membersRepository.remove(id);
  await imageService.deleteMemberImage(row.image_path);
}
