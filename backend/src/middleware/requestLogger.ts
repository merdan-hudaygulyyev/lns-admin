import type { Request } from "express";
import morgan from "morgan";

/** Query strings can contain search terms/PII, so only the path is logged. */
morgan.token("safe-url", (incoming) => {
  const req = incoming as Request;
  return req.baseUrl + req.path;
});

export const requestLogger = morgan(
  ":remote-addr :method :safe-url :status :response-time ms",
  {
    skip: (incoming) => (incoming as Request).path === "/health",
  },
);
