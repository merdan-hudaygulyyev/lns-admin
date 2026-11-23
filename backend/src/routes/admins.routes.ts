import { Router } from "express";
import * as adminsController from "../controllers/admins.controller";
import { authenticate, requireSuperAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createAdminSchema } from "../schemas/admins.schema";

export const adminsRouter = Router();

adminsRouter.use(authenticate, requireSuperAdmin);

adminsRouter.get("/", adminsController.list);
adminsRouter.post("/", validateBody(createAdminSchema), adminsController.create);
