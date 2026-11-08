import { Certificate } from "../models/Certificate";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import {
  createCertificateSchema,
  updateCertificateSchema,
} from "../schemas/certificate.schema";

export const certificatesRouter = createRouter();

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/certificates — semua sertifikat yang visible
certificatesRouter.get("/", async (c) => {
  const { category } = c.req.query();
  const filter: Record<string, unknown> = { isVisible: true };
  if (category) filter.category = category;

  const data = await Certificate.find(filter).sort({ order: 1, createdAt: 1 });
  return successResponse(c, data);
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// GET /api/certificates/admin/all — semua termasuk hidden
// ⚠️ HARUS sebelum /:id agar "admin" tidak dianggap sebagai :id parameter
certificatesRouter.get("/admin/all", authMiddleware, async (c) => {
  const data = await Certificate.find().sort({ order: 1, createdAt: 1 });
  return successResponse(c, data);
});

// GET /api/certificates/:id
certificatesRouter.get("/:id", async (c) => {
  const cert = await Certificate.findById(c.req.param("id"));
  if (!cert) return errorResponse(c, "Certificate not found", 404);
  return successResponse(c, cert);
});

// POST /api/certificates
certificatesRouter.post("/", authMiddleware, async (c) => {
  const body = await validate(c, createCertificateSchema);
  if (!body) return;

  const cert = await Certificate.create(body);
  return successResponse(c, cert, "Certificate created", 201);
});

// PUT /api/certificates/:id
certificatesRouter.put("/:id", authMiddleware, async (c) => {
  const body = await validate(c, updateCertificateSchema);
  if (!body) return;

  const cert = await Certificate.findByIdAndUpdate(
    c.req.param("id"),
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!cert) return errorResponse(c, "Certificate not found", 404);
  return successResponse(c, cert, "Certificate updated");
});

// PATCH /api/certificates/:id/visibility
certificatesRouter.patch("/:id/visibility", authMiddleware, async (c) => {
  const { isVisible } = await c.req.json();
  const cert = await Certificate.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { isVisible } },
    { new: true },
  );
  if (!cert) return errorResponse(c, "Certificate not found", 404);
  return successResponse(c, cert, "Visibility updated");
});

// PATCH /api/certificates/reorder — update urutan massal
certificatesRouter.patch("/reorder", authMiddleware, async (c) => {
  const { items } = (await c.req.json()) as {
    items: { id: string; order: number }[];
  };
  if (!Array.isArray(items))
    return errorResponse(c, "items must be an array", 400);

  await Promise.all(
    items.map(({ id, order }) =>
      Certificate.findByIdAndUpdate(id, { $set: { order } }),
    ),
  );
  return successResponse(c, null, "Order updated");
});

// DELETE /api/certificates/:id
certificatesRouter.delete("/:id", authMiddleware, async (c) => {
  const cert = await Certificate.findByIdAndDelete(c.req.param("id"));
  if (!cert) return errorResponse(c, "Certificate not found", 404);
  return successResponse(c, null, "Certificate deleted");
});
