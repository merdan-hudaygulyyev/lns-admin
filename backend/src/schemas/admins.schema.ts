import { z } from "zod";

export const createAdminSchema = z.object({
  username: z.string().trim().min(2, "Username must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  // Only regular admins can be created; the bootstrap super admin is unique.
  role: z.literal("admin"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
