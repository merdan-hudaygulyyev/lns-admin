import { Router } from "express";
import { authRouter } from "./auth.routes";
import { membersRouter } from "./members.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/members", membersRouter);
