import { Router } from "express";
import { adminsRouter } from "./admins.routes";
import { authRouter } from "./auth.routes";
import { membersRouter } from "./members.routes";
import { uploadsRouter } from "./uploads.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/admins", adminsRouter);
apiRouter.use("/members", membersRouter);
apiRouter.use("/uploads", uploadsRouter);
