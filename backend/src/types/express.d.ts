import type { AdminDto, MemberListFilters } from "./index";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminDto;
      file?: Express.Multer.File;
      uploadedImages?: Express.Multer.File[];
      validatedQuery?: MemberListFilters;
    }
  }
}

export {};
