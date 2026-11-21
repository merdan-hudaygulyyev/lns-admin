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
    files: env.maxImagesPerMember,
    fields: 31,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(AppError.unprocessable("Unsupported image type", { images: "Unsupported image type" }));
      return;
    }
    callback(null, true);
  },
});

/** Accepts the new `images` field and the legacy single `image` field. */
const parse = upload.fields([
  { name: "images", maxCount: env.maxImagesPerMember },
  { name: "image", maxCount: 1 },
]);

function collectImages(req: Request): Express.Multer.File[] {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return [...(files?.images ?? []), ...(files?.image ?? [])];
}

/**
 * Parses image parts, then verifies MIME type AND magic bytes for every file.
 * Set `required` for create, leave it false for updates.
 */
export function imageUploadMiddleware(required: boolean): RequestHandler[] {
  const inspect = (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const images = collectImages(req);

      if (images.length === 0) {
        if (required) {
          throw AppError.unprocessable("At least one image is required", {
            images: "At least one image is required",
          });
        }
        req.uploadedImages = [];
        next();
        return;
      }

      if (images.length > env.maxImagesPerMember) {
        throw AppError.unprocessable(`Maximum ${env.maxImagesPerMember} images are allowed`, {
          images: `Maximum ${env.maxImagesPerMember} images are allowed`,
        });
      }

      for (const image of images) {
        const format = detectImageFormat(image.buffer);
        if (!format) {
          throw AppError.unprocessable("File is not a recognised image", {
            images: "File signature does not match a supported image format",
          });
        }
        if (!mimeMatchesFormat(image.mimetype, format)) {
          throw AppError.unprocessable("Image MIME type does not match its contents", {
            images: "Declared content type does not match the file signature",
          });
        }
        if (format.ext === "svg") {
          image.buffer = sanitizeSvg(image.buffer);
        }
      }

      req.uploadedImages = images;
      next();
    } catch (error) {
      next(error);
    }
  };

  return [parse, inspect];
}
