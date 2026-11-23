import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import * as adminsRepository from "../repositories/admins.repository";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/AppError";

const COOKIE_NAME = "admin_token";

function extractToken(req: Request): string | undefined {
  const header = req.header("Authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return req.cookies?.[COOKIE_NAME] as string | undefined;
}

export const authenticate: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractToken(req);
    if (!token) throw AppError.unauthorized();

    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (!payload.sub || typeof payload.sub !== "string") throw AppError.unauthorized();

    const admin = await adminsRepository.findAdminById(payload.sub);
    if (!admin) throw AppError.unauthorized("Admin account no longer exists");

    req.admin = authService.toProfile(admin);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized("Session expired, please log in again"));
      return;
    }
    next(error);
  }
};

/** Admin creation is restricted to the bootstrap super administrator. */
export const requireSuperAdmin: RequestHandler = (req, _res, next) => {
  if (req.admin?.role !== "super_admin") {
    next(AppError.forbidden("Super administrator access required"));
    return;
  }
  next();
};

export const authCookieOptions = {
  httpOnly: true,
  sameSite: env.COOKIE_SAME_SITE,
  secure: env.isProduction,
  path: "/",
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  maxAge: 45 * 60 * 1000,
};
