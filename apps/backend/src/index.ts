import "./config/env";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { corsMiddleware } from "./middleware/cors";
import { loggerMiddleware } from "./middleware/logger";
import { errorHandlerMiddleware } from "./middleware/errorHandler";

// Routes
import { certificatesRouter } from "./routes/certificates";
import { projectsRouter } from "./routes/projects";
import { experiencesRouter } from "./routes/experiences";
import { skillsRouter } from "./routes/skills";
import { recommendationLettersRouter } from "./routes/recommendationLetters";
import { authRouter } from "./routes/auth";
import { contactRouter } from "./routes/contact";
import { profileRouter } from "./routes/profile";
import { educationsRouter } from "./routes/educations";

const app = new Hono();

// ── Global middleware ──────────────────────────────────────────────────────
app.use("*", loggerMiddleware);
app.use("*", corsMiddleware);
app.use("*", secureHeaders());
app.use("*", errorHandlerMiddleware);

// ── Health check ──────────────────────────────────────────────────────────
app.get("/", (c) =>
  c.json({
    name: "Irma Portfolio API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.route("/api/auth", authRouter);
app.route("/api/profile", profileRouter);
app.route("/api/educations", educationsRouter);
app.route("/api/certificates", certificatesRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/experiences", experiencesRouter);
app.route("/api/skills", skillsRouter);
app.route("/api/recommendation-letters", recommendationLettersRouter);
app.route("/api/contact", contactRouter);

// ── 404 handler ────────────────────────────────────────────────────────────
app.notFound((c) =>
  c.json({ success: false, message: "Route not found" }, 404),
);

// ── Error handler (fallback untuk error yang lolos dari errorHandlerMiddleware) ──
app.onError((err, c) => {
  console.error("Unhandled error (app.onError):", err);
  return c.json({ success: false, message: "Internal server error" }, 500);
});

// ── Start ──────────────────────────────────────────────────────────────────
async function main() {
  await connectDB();
  serve({ fetch: app.fetch, port: ENV.PORT }, () => {
    console.log(`🚀 Server running at http://localhost:${ENV.PORT}`);
  });
}

main().catch(console.error);

export default app;
