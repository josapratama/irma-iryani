import { Experience } from "../models/Experience";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import {
  createExperienceSchema,
  updateExperienceSchema,
} from "../schemas/experience.schema";

export const experiencesRouter = createRouter();

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/experiences
experiencesRouter.get("/", async (c) => {
  const { type } = c.req.query();
  const filter: Record<string, unknown> = { isVisible: true };
  if (type && ["internship", "organization"].includes(type)) filter.type = type;

  const data = await Experience.find(filter).sort({ order: 1, createdAt: 1 });
  return successResponse(c, data);
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// GET /api/experiences/admin/all
// ⚠️ HARUS sebelum /:id
experiencesRouter.get("/admin/all", authMiddleware, async (c) => {
  const data = await Experience.find().sort({ order: 1, createdAt: 1 });
  return successResponse(c, data);
});

// GET /api/experiences/:id
experiencesRouter.get("/:id", async (c) => {
  const exp = await Experience.findById(c.req.param("id"));
  if (!exp) return errorResponse(c, "Experience not found", 404);
  return successResponse(c, exp);
});

// POST /api/experiences
experiencesRouter.post("/", authMiddleware, async (c) => {
  const body = await validate(c, createExperienceSchema);
  if (!body) return;

  const exp = await Experience.create(body);
  return successResponse(c, exp, "Experience created", 201);
});

// PUT /api/experiences/:id
experiencesRouter.put("/:id", authMiddleware, async (c) => {
  const body = await validate(c, updateExperienceSchema);
  if (!body) return;

  const exp = await Experience.findByIdAndUpdate(
    c.req.param("id"),
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!exp) return errorResponse(c, "Experience not found", 404);
  return successResponse(c, exp, "Experience updated");
});

// PATCH /api/experiences/:id/points — tambah/ganti semua points sekaligus
experiencesRouter.patch("/:id/points", authMiddleware, async (c) => {
  const { points } = await c.req.json();
  if (!Array.isArray(points))
    return errorResponse(c, "points must be an array", 400);

  const exp = await Experience.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { points } },
    { new: true },
  );
  if (!exp) return errorResponse(c, "Experience not found", 404);
  return successResponse(c, exp, "Points updated");
});

// PATCH /api/experiences/:id/visibility
experiencesRouter.patch("/:id/visibility", authMiddleware, async (c) => {
  const { isVisible } = await c.req.json();
  const exp = await Experience.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { isVisible } },
    { new: true },
  );
  if (!exp) return errorResponse(c, "Experience not found", 404);
  return successResponse(c, exp, "Visibility updated");
});

// PATCH /api/experiences/reorder
experiencesRouter.patch("/reorder", authMiddleware, async (c) => {
  const { items } = (await c.req.json()) as {
    items: { id: string; order: number }[];
  };
  if (!Array.isArray(items))
    return errorResponse(c, "items must be an array", 400);

  await Promise.all(
    items.map(({ id, order }) =>
      Experience.findByIdAndUpdate(id, { $set: { order } }),
    ),
  );
  return successResponse(c, null, "Order updated");
});

// DELETE /api/experiences/:id
experiencesRouter.delete("/:id", authMiddleware, async (c) => {
  const exp = await Experience.findByIdAndDelete(c.req.param("id"));
  if (!exp) return errorResponse(c, "Experience not found", 404);
  return successResponse(c, null, "Experience deleted");
});
