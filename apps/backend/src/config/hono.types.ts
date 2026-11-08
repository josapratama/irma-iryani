// Type augmentation untuk Hono context variables
export type AppVariables = {
  adminId: string;
  adminEmail: string;
};

import { Hono } from "hono";

// Factory untuk membuat router dengan typed variables
export function createRouter() {
  return new Hono<{ Variables: AppVariables }>();
}
