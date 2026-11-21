import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { loginSchema } from "../schemas/auth.schema";

export const authRouter = Router();

// Public
authRouter.post("/login", validateBody(loginSchema), authController.login);

// Everything below this line requires a valid JWT.
authRouter.use(authenticate);

authRouter.post("/logout", authController.logout);
authRouter.get("/me", authController.me);
