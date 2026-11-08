import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin";
import { ENV } from "../config/env";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import { loginSchema, changePasswordSchema } from "../schemas/auth.schema";

export const authRouter = createRouter();

// GET /api/auth/authhub/config
authRouter.get("/authhub/config", (c) => {
  return successResponse(c, {
    authhub_url: ENV.AUTHHUB_URL,
    client_id: ENV.AUTHHUB_CLIENT_ID,
    client_slug: "irma-iryani",
  });
});

// POST /api/auth/authhub/callback
authRouter.post("/authhub/callback", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (!body.code) {
    return errorResponse(c, "Parameter 'code' otorisasi wajib disertakan", 400);
  }

  try {
    const res = await fetch(`${ENV.AUTHHUB_URL}/api/v1/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: body.code,
        clientId: ENV.AUTHHUB_CLIENT_ID,
        clientSecret: ENV.AUTHHUB_CLIENT_SECRET,
        grantType: "authorization_code",
        redirectUri: body.redirect_uri,
      }),
    });

    const data: any = await res.json();
    if (!res.ok) {
      return errorResponse(c, data.error || "Gagal otorisasi dengan AuthHub", res.status as any);
    }

    const user = data.user;
    if (!user) {
      return errorResponse(c, "Data pengguna AuthHub tidak ditemukan", 401);
    }

    // Role check: Only dedicated Irma user or root superadmin allowed
    const isSuper = user.globalRole === "superadmin" || user.appRole === "superadmin";
    const isAdmin = user.appRole === "admin";
    const isIrma =
      user.username === "irma" ||
      user.username === "irmairyani" ||
      user.email?.toLowerCase().includes("irma");

    if (!isSuper && !isAdmin && !isIrma) {
      return errorResponse(
        c,
        "Akses ditolak: Akun Anda tidak memiliki izin akses Administrator ke Portfolio Irma Iryani.",
        403
      );
    }

    // Upsert admin in local database
    let admin = await Admin.findOne({ email: user.email.toLowerCase() });
    if (!admin) {
      admin = await Admin.create({
        email: user.email.toLowerCase(),
        passwordHash: "AUTHHUB_SSO_OAUTH_ACCOUNT",
      });
    }

    const token = jwt.sign(
      { adminId: admin._id.toString(), email: admin.email },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return successResponse(
      c,
      { token, email: admin.email, name: user.name || "Irma Iryani" },
      "Login AuthHub SSO berhasil"
    );
  } catch (err: any) {
    return errorResponse(c, `Gagal menghubungi server AuthHub: ${err.message}`, 502);
  }
});

// POST /api/auth/login
authRouter.post("/login", async (c) => {
  const body = await validate(c, loginSchema);
  if (!body) return;

  const admin = await Admin.findOne({ email: body.email.toLowerCase() });
  if (!admin) return errorResponse(c, "Invalid credentials", 401);

  const valid = await bcrypt.compare(body.password, admin.passwordHash);
  if (!valid) return errorResponse(c, "Invalid credentials", 401);

  const token = jwt.sign(
    { adminId: admin._id.toString(), email: admin.email },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  return successResponse(c, { token, email: admin.email }, "Login successful");
});

// GET /api/auth/me  (protected)
authRouter.get("/me", authMiddleware, async (c) => {
  const email = c.get("adminEmail");
  return successResponse(c, { email }, "Authenticated");
});

// PATCH /api/auth/change-password  (protected)
authRouter.patch("/change-password", authMiddleware, async (c) => {
  const body = await validate(c, changePasswordSchema);
  if (!body) return;

  const adminId = c.get("adminId");
  const admin = await Admin.findById(adminId);
  if (!admin) return errorResponse(c, "Admin not found", 404);

  const valid = await bcrypt.compare(body.currentPassword, admin.passwordHash);
  if (!valid) return errorResponse(c, "Current password is incorrect", 401);

  admin.passwordHash = await bcrypt.hash(body.newPassword, 12);
  await admin.save();

  return successResponse(c, null, "Password changed successfully");
});

// POST /api/auth/setup — hanya jalan kalau belum ada admin (one-time setup)
authRouter.post("/setup", async (c) => {
  const count = await Admin.countDocuments();
  if (count > 0) return errorResponse(c, "Admin already exists", 409);

  const body = await validate(c, loginSchema);
  if (!body) return;

  const passwordHash = await bcrypt.hash(body.password, 12);
  const admin = await Admin.create({ email: body.email, passwordHash });

  return successResponse(c, { email: admin.email }, "Admin created", 201);
});
