export type Currency = "TL" | "USD";
export type AdminRole = "super_admin" | "admin";

export interface AdminRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: AdminRole;
  created_at: Date;
  updated_at: Date;
}

export interface AdminDto {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

export interface MemberRow {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  mother_name: string;
  heir: string;
  passport_number: string;
  passport_hash: string;
  birth_date: string | Date;
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
  registration_date: string | Date;
  amount: string;
  currency: Currency;
  image_path: string;
  image_paths: string[];
  created_at: Date;
  updated_at: Date;
}

/** Every hash field is deliberately absent from both list and detail DTOs. */
export interface MemberDto {
  id: string;
  username: string;
  fullName: string;
  motherName: string;
  heir: string;
  passportNumber: string;
  birthDate: string;
  secretQuestion: string;
  email: string;
  phone: string;
  inviter: string;
  product: string;
  address: string;
  postalIndex: string;
  officialSite: string;
  registrationDate: string;
  amount: number;
  currency: Currency;
  /** First gallery image; kept for existing list views. */
  imagePath: string;
  imagePaths: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberInput {
  username: string;
  password: string;
  fullName: string;
  motherName: string;
  heir: string;
  passportNumber: string;
  birthDate: string;
  secretQuestion: string;
  secretAnswer: string;
  email: string;
  pinCode: string;
  phone: string;
  inviter: string;
  product: string;
  address: string;
  postalIndex: string;
  officialSite: string;
  registrationDate: string;
  amount: number;
  currency: Currency;
  /**
   * Ordered gallery tokens: `existing:<public path>` or `new:<zero-based index>`.
   * Used on update to keep, remove and reorder images in one request.
   */
  imageOrder?: string[];
}

export type UpdateMemberInput = Partial<CreateMemberInput>;

export interface MemberListFilters {
  page: number;
  limit: number;
  search?: string;
  currency?: Currency;
  product?: string;
  inviter?: string;
  amountMin?: number;
  amountMax?: number;
  registrationFrom?: string;
  registrationTo?: string;
  birthFrom?: string;
  birthTo?: string;
  sortBy: "created_at" | "full_name" | "amount" | "registration_date";
  order: "asc" | "desc";
  passportHash?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
