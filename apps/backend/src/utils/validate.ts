import { Context } from "hono";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "./response";
import type { AppVariables } from "../config/hono.types";

/**
 * Parse + validate request body dengan Zod.
 * Return value:
 *   - parsed data kalau valid
 *   - never (throws / returns Response) kalau invalid
 *
 * Caller harus check: `if (!body) return;` karena TypeScript
 * tidak bisa tahu bahwa errorResponse sudah mengirim response.
 */
export async function validate<T>(
  c: Context<{ Variables: AppVariables }>,
  schema: ZodSchema<T>,
): Promise<T | null> {
  try {
    const body = await c.req.json();
    return schema.parse(body) as T;
  } catch (err) {
    if (err instanceof ZodError) {
      // Cast to unknown first supaya TypeScript tidak komplain
      // tentang return type mismatch — response sudah dikirim ke client
      errorResponse(
        c,
        "Validation failed",
        422,
        err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      ) as unknown;
    } else {
      errorResponse(c, "Invalid JSON body", 400) as unknown;
    }
    return null;
  }
}
