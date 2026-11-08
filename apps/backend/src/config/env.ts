import { config } from "dotenv";
config();

export const ENV = {
  PORT: Number(process.env.PORT) || 3001,
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "changeme-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ?? "",
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "",
  SMTP_TO: process.env.SMTP_TO ?? "",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  AUTHHUB_URL: process.env.AUTHHUB_URL ?? "https://auth.josapratama.com",
  AUTHHUB_CLIENT_ID: process.env.AUTHHUB_CLIENT_ID ?? "ah_client_irma_5a6b7c",
  AUTHHUB_CLIENT_SECRET: process.env.AUTHHUB_CLIENT_SECRET ?? "ah_secret_irma_6c7d8e9f0a1b2c3d4e5f6a",
} as const;
