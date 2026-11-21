import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), "Invalid date");

const phone = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, "Use international format, e.g. +905551234567");

const email = z.string().trim().toLowerCase().email("Invalid email address").max(255);
const officialSite = z.string().trim().url("Invalid URL").max(1000);
const amount = z.coerce
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .max(9_999_999_999.99, "Amount is too large");

const createMemberSchema = z.object({
  username: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(200),
  fullName: z.string().trim().min(1).max(255),
  motherName: z.string().trim().min(1).max(255),
  heir: z.string().trim().min(1).max(255),
  passportNumber: z.string().trim().min(3).max(100),
  birthDate: dateString,
  secretQuestion: z.string().trim().min(1).max(500),
  secretAnswer: z.string().trim().min(2).max(200),
  email,
  pinCode: z.string().trim().regex(/^\d{4,12}$/, "PIN must be 4-12 digits"),
  phone,
  inviter: z.string().trim().min(1).max(255),
  product: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1).max(2000),
  postalIndex: z.string().trim().min(1).max(30),
  officialSite,
  registrationDate: dateString,
  amount,
  currency: z.enum(["TL", "USD"]),
});

/** Blank string means "leave unchanged" for secret fields on update. */
const unchangedIfBlank = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T> =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema,
  );

const updateMemberSchema = createMemberSchema.partial().extend({
  username: unchangedIfBlank(createMemberSchema.shape.username.optional()),
  fullName: unchangedIfBlank(createMemberSchema.shape.fullName.optional()),
  motherName: unchangedIfBlank(createMemberSchema.shape.motherName.optional()),
  heir: unchangedIfBlank(createMemberSchema.shape.heir.optional()),
  passportNumber: unchangedIfBlank(createMemberSchema.shape.passportNumber.optional()),
  birthDate: unchangedIfBlank(createMemberSchema.shape.birthDate.optional()),
  secretQuestion: unchangedIfBlank(createMemberSchema.shape.secretQuestion.optional()),
  email: unchangedIfBlank(createMemberSchema.shape.email.optional()),
  phone: unchangedIfBlank(createMemberSchema.shape.phone.optional()),
  inviter: unchangedIfBlank(createMemberSchema.shape.inviter.optional()),
  product: unchangedIfBlank(createMemberSchema.shape.product.optional()),
  address: unchangedIfBlank(createMemberSchema.shape.address.optional()),
  postalIndex: unchangedIfBlank(createMemberSchema.shape.postalIndex.optional()),
  officialSite: unchangedIfBlank(createMemberSchema.shape.officialSite.optional()),
  amount: unchangedIfBlank(createMemberSchema.shape.amount.optional()),
  currency: unchangedIfBlank(createMemberSchema.shape.currency.optional()),
  password: unchangedIfBlank(createMemberSchema.shape.password.optional()),
  pinCode: unchangedIfBlank(createMemberSchema.shape.pinCode.optional()),
  secretAnswer: unchangedIfBlank(createMemberSchema.shape.secretAnswer.optional()),
});

const optionalNumber = (schema: z.ZodTypeAny) =>
  z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? undefined : Number(value)),
    schema,
  );

const optionalString = (schema: z.ZodTypeAny) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const listMembersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(200).optional(),
  currency: z.enum(["TL", "USD"]).optional(),
  product: z.string().trim().max(255).optional(),
  inviter: z.string().trim().max(255).optional(),
  amountMin: optionalNumber(z.number().nonnegative().optional()),
  amountMax: optionalNumber(z.number().nonnegative().optional()),
  registrationFrom: optionalString(dateString.optional()),
  registrationTo: optionalString(dateString.optional()),
  birthFrom: optionalString(dateString.optional()),
  birthTo: optionalString(dateString.optional()),
  sortBy: z.enum(["created_at", "full_name", "amount", "registration_date"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const idParamSchema = z.object({
  id: z.string().uuid("Invalid member id"),
});

export {
  createMemberSchema,
  updateMemberSchema,
  listMembersSchema,
  idParamSchema,
};

export type CreateMemberSchema = z.infer<typeof createMemberSchema>;
export type UpdateMemberSchema = z.infer<typeof updateMemberSchema>;
export type ListMembersQuery = z.infer<typeof listMembersSchema>;
