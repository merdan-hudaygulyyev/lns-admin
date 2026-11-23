export type Currency = "TL" | "USD";
export type Locale = "tk" | "ru" | "tm";
export type AdminRole = "super_admin" | "admin";

export interface Admin {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  createdAt: string;
}

export interface Member {
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
  /** First gallery image; kept for the members table thumbnail. */
  imagePath: string;
  imagePaths: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorShape {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface MemberListParams {
  page: number;
  limit: number;
  search?: string;
  currency?: Currency | "";
  product?: string;
  inviter?: string;
  amountMin?: string;
  amountMax?: string;
  registrationFrom?: string;
  registrationTo?: string;
  birthFrom?: string;
  birthTo?: string;
  sortBy?: "created_at" | "full_name" | "amount" | "registration_date";
  order?: "asc" | "desc";
}

/** One gallery item: either a saved path or a newly selected file with a local preview. */
export interface UploadImage {
  id: string;
  path?: string;
  file?: File;
  previewUrl?: string;
}

export interface MemberFormValues {
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
  amount: string;
  currency: Currency;
  images: UploadImage[];
}

export const EMPTY_MEMBER_FORM: MemberFormValues = {
  username: "",
  password: "",
  fullName: "",
  motherName: "",
  heir: "",
  passportNumber: "",
  birthDate: "",
  secretQuestion: "",
  secretAnswer: "",
  email: "",
  pinCode: "",
  phone: "",
  inviter: "",
  product: "",
  address: "",
  postalIndex: "",
  officialSite: "",
  registrationDate: "",
  amount: "",
  currency: "TL",
  images: [],
};
