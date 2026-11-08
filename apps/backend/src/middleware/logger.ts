import { logger } from "hono/logger";

export const loggerMiddleware = logger((message, ...rest) => {
  console.log(`[${new Date().toISOString()}]`, message, ...rest);
});
