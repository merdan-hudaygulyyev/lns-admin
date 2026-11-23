import { Router } from "express";
import * as uploadsController from "../controllers/uploads.controller";
import { authenticate } from "../middleware/auth";
import { validateParams } from "../middleware/validate";
import { downloadFileSchema } from "../schemas/uploads.schema";

export const uploadsRouter = Router();

uploadsRouter.use(authenticate);

uploadsRouter.get("/download/:filename", validateParams(downloadFileSchema), uploadsController.download);
