import { SkillGroup } from "../models/Skill";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import {
  createSkillGroupSchema,
  updateSkillGroupSchema,
  addSkillItemSchema,
  updateSkillItemSchema,
} from "../schemas/skill.schema";

export const skillsRouter = createRouter();

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/skills
skillsRouter.get("/", async (c) => {
  const { category } = c.req.query();
  const filter: Record<string, unknown> = { isVisible: true };
  if (category && ["hard", "soft", "language"].includes(category))
    filter.category = category;

  const data = await SkillGroup.find(filter).sort({ order: 1 });
  return successResponse(c, data);
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// GET /api/skills/admin/all
// ⚠️ HARUS sebelum /:id
skillsRouter.get("/admin/all", authMiddleware, async (c) => {
  const data = await SkillGroup.find().sort({ order: 1 });
  return successResponse(c, data);
});

// GET /api/skills/:id
skillsRouter.get("/:id", async (c) => {
  const group = await SkillGroup.findById(c.req.param("id"));
  if (!group) return errorResponse(c, "Skill group not found", 404);
  return successResponse(c, group);
});

// POST /api/skills — buat skill group baru
skillsRouter.post("/", authMiddleware, async (c) => {
  const body = await validate(c, createSkillGroupSchema);
  if (!body) return;

  const group = await SkillGroup.create(body);
  return successResponse(c, group, "Skill group created", 201);
});

// PUT /api/skills/:id — update seluruh group
skillsRouter.put("/:id", authMiddleware, async (c) => {
  const body = await validate(c, updateSkillGroupSchema);
  if (!body) return;

  const group = await SkillGroup.findByIdAndUpdate(
    c.req.param("id"),
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!group) return errorResponse(c, "Skill group not found", 404);
  return successResponse(c, group, "Skill group updated");
});

// POST /api/skills/:id/items — tambah satu skill item ke group
skillsRouter.post("/:id/items", authMiddleware, async (c) => {
  const body = await validate(c, addSkillItemSchema);
  if (!body) return;

  const group = await SkillGroup.findByIdAndUpdate(
    c.req.param("id"),
    { $push: { items: body } },
    { new: true },
  );
  if (!group) return errorResponse(c, "Skill group not found", 404);
  return successResponse(c, group, "Skill item added");
});

// PUT /api/skills/:id/items/:index — update skill item by index
skillsRouter.put("/:id/items/:index", authMiddleware, async (c) => {
  const body = await validate(c, updateSkillItemSchema);
  if (!body) return;

  const idx = Number(c.req.param("index"));
  if (isNaN(idx) || idx < 0) return errorResponse(c, "Invalid index", 400);

  const group = await SkillGroup.findById(c.req.param("id"));
  if (!group) return errorResponse(c, "Skill group not found", 404);
  if (idx >= group.items.length)
    return errorResponse(c, "Index out of range", 400);

  if (body.name !== undefined) group.items[idx].name = body.name;
  if (body.level !== undefined) group.items[idx].level = body.level;
  await group.save();

  return successResponse(c, group, "Skill item updated");
});

// DELETE /api/skills/:id/items/:index — hapus skill item by index
skillsRouter.delete("/:id/items/:index", authMiddleware, async (c) => {
  const idx = Number(c.req.param("index"));
  if (isNaN(idx) || idx < 0) return errorResponse(c, "Invalid index", 400);

  const group = await SkillGroup.findById(c.req.param("id"));
  if (!group) return errorResponse(c, "Skill group not found", 404);
  if (idx >= group.items.length)
    return errorResponse(c, "Index out of range", 400);

  group.items.splice(idx, 1);
  await group.save();

  return successResponse(c, group, "Skill item deleted");
});

// PATCH /api/skills/:id/items/reorder — susun ulang items dalam satu group
skillsRouter.patch("/:id/items/reorder", authMiddleware, async (c) => {
  const { items } = (await c.req.json()) as {
    items: { name: string; level: number }[];
  };
  if (!Array.isArray(items))
    return errorResponse(c, "items must be an array", 400);

  const group = await SkillGroup.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { items } },
    { new: true },
  );
  if (!group) return errorResponse(c, "Skill group not found", 404);
  return successResponse(c, group, "Items reordered");
});

// PATCH /api/skills/:id/visibility
skillsRouter.patch("/:id/visibility", authMiddleware, async (c) => {
  const { isVisible } = await c.req.json();
  const group = await SkillGroup.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { isVisible } },
    { new: true },
  );
  if (!group) return errorResponse(c, "Skill group not found", 404);
  return successResponse(c, group, "Visibility updated");
});

// DELETE /api/skills/:id
skillsRouter.delete("/:id", authMiddleware, async (c) => {
  const group = await SkillGroup.findByIdAndDelete(c.req.param("id"));
  if (!group) return errorResponse(c, "Skill group not found", 404);
  return successResponse(c, null, "Skill group deleted");
});
