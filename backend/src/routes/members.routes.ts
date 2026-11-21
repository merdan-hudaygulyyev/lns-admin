import { Router } from "express";
import * as membersController from "../controllers/members.controller";
import { authenticate } from "../middleware/auth";
import { imageUploadMiddleware } from "../middleware/upload";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import { createMemberSchema, idParamSchema, listMembersSchema, updateMemberSchema } from "../schemas/members.schema";

export const membersRouter = Router();

membersRouter.use(authenticate);

membersRouter.post(
  "/",
  imageUploadMiddleware(true),
  validateBody(createMemberSchema),
  membersController.create,
);

membersRouter.get("/", validateQuery(listMembersSchema), membersController.getAll);

membersRouter.get("/:id", validateParams(idParamSchema), membersController.getById);

membersRouter.put(
  "/:id",
  validateParams(idParamSchema),
  imageUploadMiddleware(false),
  validateBody(updateMemberSchema),
  membersController.update,
);

membersRouter.delete("/:id", validateParams(idParamSchema), membersController.remove);
