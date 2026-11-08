import { Context } from "hono";
import type { AppVariables } from "../config/hono.types";

type AppContext = Context<{ Variables: AppVariables }>;

export function successResponse(
  c: AppContext,
  data: unknown,
  message = "OK",
  status = 200,
) {
  return c.json({ success: true, message, data }, status as 200 | 201);
}

export function errorResponse(
  c: AppContext,
  message: string,
  status = 400,
  errors?: unknown,
) {
  return c.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    status as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
  );
}
