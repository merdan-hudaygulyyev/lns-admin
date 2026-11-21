/** Minimal structured logger. Never pass request bodies or secrets here. */
function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(`[${timestamp()}] INFO  ${message}`, meta ?? "");
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[${timestamp()}] WARN  ${message}`, meta ?? "");
  },
  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[${timestamp()}] ERROR ${message}`, meta ?? "");
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${timestamp()}] DEBUG ${message}`, meta ?? "");
    }
  },
};
