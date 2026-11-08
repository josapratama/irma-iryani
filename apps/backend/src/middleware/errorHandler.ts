import { Context, Next } from "hono";
import type { AppVariables } from "../config/hono.types";

/**
 * Global try/catch middleware — membungkus semua route handler.
 * Kalau MongoDB atau logic error tidak tertangkap di handler,
 * middleware ini yang akan catch dan return 500 yang proper.
 */
export async function errorHandlerMiddleware(
  c: Context<{ Variables: AppVariables }>,
  next: Next
) {
  try {
    await next();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Unhandled error:`, err);

    const message =
      err instanceof Error ? err.message : "Internal server error";

    // Hindari expose detail error di production
    const isDev = process.env.NODE_ENV === "development";

    return c.json(
      {
        success: false,
        message: "Internal server error",
        ...(isDev ? { detail: message } : {}),
      },
      500
    );
  }
}
