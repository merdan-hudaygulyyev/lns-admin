import { Request, Response } from "express";
import type { CreateAdminInput } from "../schemas/admins.schema";
import * as adminsService from "../services/admins.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/responses";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminsService.listAdmins());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const admin = await adminsService.createAdmin(req.body as CreateAdminInput);
  sendSuccess(res, admin, 201);
});
