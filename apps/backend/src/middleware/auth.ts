import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { errorResponse } from "../utils/response";
import type { AppVariables } from "../config/hono.types";

interface JwtPayload {
  adminId: string;
  email: string;
}

export async function authMiddleware(
  c: Context<{ Variables: AppVariables }>,
  next: Next,
) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(c, "Unauthorized — missing or invalid token", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    c.set("adminId", payload.adminId);
    c.set("adminEmail", payload.email);
    await next();
  } catch {
    return errorResponse(c, "Unauthorized — token expired or invalid", 401);
  }
}
