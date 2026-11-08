import { cors } from "hono/cors";
import { ENV } from "../config/env";

const rawOrigins = ENV.FRONTEND_URL.split(",")
  .map((u) => u.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...rawOrigins.map((u) =>
    u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`,
  ),
  ...rawOrigins,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://irma-iryani.josapratama.com",
];

export const corsMiddleware = cors({
  origin: (incomingOrigin) => {
    if (!incomingOrigin) return "https://irma-iryani.josapratama.com";
    const cleanOrigin = incomingOrigin.trim().replace(/\/+$/, "");

    if (
      cleanOrigin.includes("josapratama.com") ||
      cleanOrigin.includes("josapratama.cloud") ||
      cleanOrigin.includes("localhost") ||
      cleanOrigin.includes("127.0.0.1") ||
      allowedOrigins.some((ao) => ao === cleanOrigin)
    ) {
      return incomingOrigin;
    }
    return incomingOrigin;
  },
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
