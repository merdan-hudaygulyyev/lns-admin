import { NextFunction, Request, RequestHandler, Response } from "express";
import multer from "multer";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  detectImageFormat,
  mimeMatchesFormat,
  sanitizeSvg,
} from "../utils/imageSignature";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSizeBytes,
    files: 1,
    fields: 30,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(AppError.unprocessable("Unsupported image type", { image: "Unsupported image type" }));
      return;
    }
    callback(null, true);
  },
});

/**
 * Parses the optional `image` part, then verifies MIME type AND magic bytes.
 * Set `required` for create, leave it false for updates.
 */
export function imageUploadMiddleware(required: boolean): RequestHandler[] {
  const parse = upload.single("image");

  const inspect = (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.file) {
        if (required) {
          throw AppError.unprocessable("Image is required", { image: "Image is required" });
        }
        next();
        return;
      }

      const format = detectImageFormat(req.file.buffer);
      if (!format) {
        throw AppError.unprocessable("File is not a recognised image", {
          image: "File signature does not match a supported image format",
        });
      }
      if (!mimeMatchesFormat(req.file.mimetype, format)) {
        throw AppError.unprocessable("Image MIME type does not match its contents", {
          image: "Declared content type does not match the file signature",
        });
      }
      if (format.ext === "svg") {
        req.file.buffer = sanitizeSvg(req.file.buffer);
      }
      next();
    } catch (error) {
      next(error);
    }
  };

  return [parse, inspect];
}
