import { z } from "zod";

export const downloadFileSchema = z.object({
  // Stored uploads are flat files such as 6f1c....png. Reject separators and
  // traversal segments before touching the filesystem.
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "Invalid filename"),
});

export type DownloadFileParams = z.infer<typeof downloadFileSchema>;
