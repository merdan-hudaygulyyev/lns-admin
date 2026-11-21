import { Request, Response } from "express";
import type { CreateMemberSchema, UpdateMemberSchema } from "../schemas/members.schema";
import * as membersService from "../services/members.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/responses";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const member = await membersService.create(
    req.body as CreateMemberSchema,
    req.file as Express.Multer.File,
  );
  sendSuccess(res, member, 201);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await membersService.list(req.validatedQuery!);
  sendSuccess(res, result.data, 200, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await membersService.getById(req.params.id));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const member = await membersService.update(
    req.params.id,
    req.body as UpdateMemberSchema,
    req.file,
  );
  sendSuccess(res, member);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await membersService.remove(req.params.id);
  sendSuccess(res, { id: req.params.id });
});
