import { Education } from "../models/Education";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import {
  createEducationSchema,
  updateEducationSchema,
} from "../schemas/education.schema";

export const educationsRouter = createRouter();

const defaultEducationData = [
  {
    degree: {
      id: "S1 Pendidikan Kimia",
      en: "Bachelor of Chemistry Education",
      ja: "化学教育学士",
    },
    university: {
      id: "Universitas Sriwijaya",
      en: "Sriwijaya University",
      ja: "スリウィジャヤ大学",
    },
    period: {
      id: "Agustus 2022 – Mei 2026",
      en: "August 2022 – May 2026",
      ja: "2022年8月〜2026年5月",
    },
    gpa: "3,90",
    description: {
      id: "Fakultas Keguruan dan Ilmu Pendidikan, Jurusan Pendidikan MIPA.",
      en: "Faculty of Teacher Training and Education, Mathematics and Natural Sciences Education.",
      ja: "教員養成教育学部 数学・自然科学教育学科。",
    },
    order: 1,
    isVisible: true,
  },
];

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/educations
educationsRouter.get("/", async (c) => {
  let data = await Education.find({ isVisible: true }).sort({
    order: 1,
    createdAt: 1,
  });

  // Seed default if empty
  if (data.length === 0) {
    await Education.insertMany(defaultEducationData);
    data = await Education.find({ isVisible: true }).sort({
      order: 1,
      createdAt: 1,
    });
  }

  return successResponse(c, data);
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// GET /api/educations/admin/all
educationsRouter.get("/admin/all", authMiddleware, async (c) => {
  let data = await Education.find().sort({ order: 1, createdAt: 1 });
  if (data.length === 0) {
    await Education.insertMany(defaultEducationData);
    data = await Education.find().sort({ order: 1, createdAt: 1 });
  }
  return successResponse(c, data);
});

// GET /api/educations/:id
educationsRouter.get("/:id", async (c) => {
  const item = await Education.findById(c.req.param("id"));
  if (!item) return errorResponse(c, "Education not found", 404);
  return successResponse(c, item);
});

// POST /api/educations
educationsRouter.post("/", authMiddleware, async (c) => {
  const body = await validate(c, createEducationSchema);
  if (!body) return;

  const item = await Education.create(body);
  return successResponse(c, item, "Education created", 201);
});

// PUT /api/educations/:id
educationsRouter.put("/:id", authMiddleware, async (c) => {
  const body = await validate(c, updateEducationSchema);
  if (!body) return;

  const item = await Education.findByIdAndUpdate(
    c.req.param("id"),
    { $set: body },
    { new: true, runValidators: true }
  );
  if (!item) return errorResponse(c, "Education not found", 404);
  return successResponse(c, item, "Education updated");
});

// DELETE /api/educations/:id
educationsRouter.delete("/:id", authMiddleware, async (c) => {
  const item = await Education.findByIdAndDelete(c.req.param("id"));
  if (!item) return errorResponse(c, "Education not found", 404);
  return successResponse(c, null, "Education deleted");
});

// PATCH /api/educations/reorder
educationsRouter.patch("/reorder", authMiddleware, async (c) => {
  const body = await c.req.json<{ ids: string[] }>().catch(() => null);
  if (!body?.ids || !Array.isArray(body.ids)) {
    return errorResponse(c, "Array of ids is required", 400);
  }

  const ops = body.ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index + 1 } },
    },
  }));

  await Education.bulkWrite(ops);
  return successResponse(c, null, "Educations reordered");
});
