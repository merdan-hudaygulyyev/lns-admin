import bcrypt from "bcrypt";
import { env } from "../config/env";
import * as membersRepository from "../repositories/members.repository";
import type {
  CreateMemberInput,
  MemberDto,
  MemberListFilters,
  MemberRow,
  PaginationMeta,
  UpdateMemberInput,
} from "../types";
import { AppError } from "../utils/AppError";
import { blindIndexPassport, decryptPassport, encryptPassport, maskPassport } from "../utils/crypto";
import * as imageService from "./image.service";

type UploadedImage = Express.Multer.File;

const EXISTING_PREFIX = "existing:";
const NEW_PREFIX = "new:";

function toDateString(value: string | Date): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function existingImagePaths(row: MemberRow): string[] {
  if (row.image_paths?.length) {
    return row.image_paths.map((path) => imageService.imageUrl(path));
  }
  return row.image_path ? [imageService.imageUrl(row.image_path)] : [];
}

/** Hashes are stripped here: this is the single serialization boundary for members. */
export function toMemberDto(row: MemberRow, revealPassport = false): MemberDto {
  const passport = decryptPassport(row.passport_number);
  const imagePaths = existingImagePaths(row);

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
    imagePath: imagePaths[0] ?? "",
    imagePaths,
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

function invalidImageOrder(): AppError {
  return AppError.unprocessable("Invalid image order", {
    imageOrder: "Image order does not match the member images",
  });
}

/** File cleanup is best-effort: a missing/removed upload must not fail the request. */
async function deleteImages(paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => imageService.deleteMemberImage(path).catch(() => undefined)));
}

async function storeImages(files: UploadedImage[]): Promise<string[]> {
  const stored: string[] = [];
  try {
    for (const file of files) {
      stored.push(await imageService.storeMemberImage(file));
    }
    return stored;
  } catch (error) {
    await deleteImages(stored);
    throw error;
  }
}

/**
 * Resolves the final ordered gallery from the client token list.
 * `existing:` tokens reference saved paths; `new:N` tokens reference uploaded files in order.
 */
function resolveImagePaths(
  order: string[] | undefined,
  existing: string[],
  images: UploadedImage[],
  stored: string[],
): string[] {
  let paths: string[];

  if (!order) {
    paths = [...existing, ...stored];
  } else {
    paths = [];
    const usedNew = new Set<number>();

    for (const token of order) {
      if (token.startsWith(EXISTING_PREFIX)) {
        const path = token.slice(EXISTING_PREFIX.length);
        if (!existing.includes(path) || paths.includes(path)) throw invalidImageOrder();
        paths.push(path);
        continue;
      }

      if (token.startsWith(NEW_PREFIX)) {
        const index = Number(token.slice(NEW_PREFIX.length));
        if (!Number.isInteger(index) || index < 0 || index >= stored.length || usedNew.has(index)) {
          throw invalidImageOrder();
        }
        usedNew.add(index);
        paths.push(stored[index]);
        continue;
      }

      throw invalidImageOrder();
    }

    if (usedNew.size !== stored.length) throw invalidImageOrder();
  }

  if (paths.length === 0) {
    throw AppError.unprocessable("At least one image is required", {
      images: "At least one image is required",
    });
  }
  if (paths.length > env.maxImagesPerMember) {
    throw AppError.unprocessable(`Maximum ${env.maxImagesPerMember} images are allowed`, {
      images: `Maximum ${env.maxImagesPerMember} images are allowed`,
    });
  }
  if (images.length !== stored.length) {
    throw AppError.unprocessable("Not all uploaded images were stored", {
      images: "Not all uploaded images were stored",
    });
  }

  return paths;
}

export async function create(
  input: CreateMemberInput,
  imageFiles: UploadedImage[],
): Promise<MemberDto> {
  const [passwordHash, pinHash, answerHash] = await Promise.all([
    bcrypt.hash(input.password, env.BCRYPT_ROUNDS),
    bcrypt.hash(input.pinCode, env.BCRYPT_ROUNDS),
    bcrypt.hash(input.secretAnswer, env.BCRYPT_ROUNDS),
  ]);

  const storedPaths = await storeImages(imageFiles);
  let imagePaths: string[];
  try {
    imagePaths = resolveImagePaths(input.imageOrder, [], imageFiles, storedPaths);
  } catch (error) {
    await deleteImages(storedPaths);
    throw error;
  }

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
      image_path: imagePaths[0],
      image_paths: imagePaths,
    });
    return toMemberDto(row);
  } catch (error) {
    // Do not leave orphan files behind when the insert fails.
    await deleteImages(storedPaths);
    translateDbError(error);
  }
}

export async function list(
  filters: MemberListFilters,
): Promise<{ data: MemberDto[]; meta: PaginationMeta }> {
  const normalize = (value?: string) => value?.trim().replace(/\s+/g, " ") || undefined;
  const search = normalize(filters.search);
  const passportHash =
    search && search.length >= 3 ? blindIndexPassport(search) : undefined;

  const { rows, total } = await membersRepository.findMany({
    ...filters,
    search,
    product: normalize(filters.product),
    inviter: normalize(filters.inviter),
    passportHash,
  });
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
  imageFiles: UploadedImage[] = [],
): Promise<MemberDto> {
  const existing = await membersRepository.findById(id);
  if (!existing) throw AppError.notFound("Member not found");

  const existingPaths = existingImagePaths(existing);
  const storedPaths = await storeImages(imageFiles);
  let imagePaths: string[];
  try {
    imagePaths = resolveImagePaths(input.imageOrder, existingPaths, imageFiles, storedPaths);
  } catch (error) {
    await deleteImages(storedPaths);
    throw error;
  }

  const patch: membersRepository.MemberPatch = {};
  for (const [key, column] of Object.entries(plainFieldMap)) {
    const value = input[key as keyof UpdateMemberInput];
    if (value !== undefined && column) {
      (patch as Record<string, unknown>)[column] = value;
    }
  }

  if (input.email !== undefined) patch.email = input.email.toLowerCase();
  patch.image_path = imagePaths[0];
  patch.image_paths = imagePaths;

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

  try {
    const row = await membersRepository.update(id, patch);
    if (!row) throw AppError.notFound("Member not found");

    const removed = existingPaths.filter((path) => !imagePaths.includes(path));
    await deleteImages(removed);
    return toMemberDto(row, true);
  } catch (error) {
    await deleteImages(storedPaths);
    translateDbError(error);
  }
}

export async function remove(id: string): Promise<void> {
  const row = await membersRepository.findById(id);
  if (!row) throw AppError.notFound("Member not found");
  await membersRepository.remove(id);
  await deleteImages(existingImagePaths(row));
}
