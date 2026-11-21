import { Request, Response } from "express";
import { authCookieOptions } from "../middleware/auth";
import { env } from "../config/env";
import type { LoginInput } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/responses";

const COOKIE_NAME = "admin_token";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body as LoginInput;
  const result = await authService.login(username, password);

  res.cookie(COOKIE_NAME, result.token, authCookieOptions);
  sendSuccess(res, result);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: authCookieOptions.httpOnly,
    sameSite: authCookieOptions.sameSite,
    secure: authCookieOptions.secure,
    path: authCookieOptions.path,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  });
  sendSuccess(res, { loggedOut: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, req.admin);
});
