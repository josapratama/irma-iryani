import { Project } from "../models/Project";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema";

export const projectsRouter = createRouter();

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/projects
projectsRouter.get("/", async (c) => {
  const data = await Project.find({ isVisible: true }).sort({
    order: 1,
    createdAt: 1,
  });
  return successResponse(c, data);
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// GET /api/projects/admin/all
// ⚠️ HARUS sebelum /:id
projectsRouter.get("/admin/all", authMiddleware, async (c) => {
  const data = await Project.find().sort({ order: 1, createdAt: 1 });
  return successResponse(c, data);
});

// GET /api/projects/:id
projectsRouter.get("/:id", async (c) => {
  const project = await Project.findById(c.req.param("id"));
  if (!project) return errorResponse(c, "Project not found", 404);
  return successResponse(c, project);
});

// POST /api/projects
projectsRouter.post("/", authMiddleware, async (c) => {
  const body = await validate(c, createProjectSchema);
  if (!body) return;

  const project = await Project.create(body);
  return successResponse(c, project, "Project created", 201);
});

// PUT /api/projects/:id
projectsRouter.put("/:id", authMiddleware, async (c) => {
  const body = await validate(c, updateProjectSchema);
  if (!body) return;

  const project = await Project.findByIdAndUpdate(
    c.req.param("id"),
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!project) return errorResponse(c, "Project not found", 404);
  return successResponse(c, project, "Project updated");
});

// PATCH /api/projects/:id/visibility
projectsRouter.patch("/:id/visibility", authMiddleware, async (c) => {
  const { isVisible } = await c.req.json();
  const project = await Project.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { isVisible } },
    { new: true },
  );
  if (!project) return errorResponse(c, "Project not found", 404);
  return successResponse(c, project, "Visibility updated");
});

// PATCH /api/projects/reorder
projectsRouter.patch("/reorder", authMiddleware, async (c) => {
  const { items } = (await c.req.json()) as {
    items: { id: string; order: number }[];
  };
  if (!Array.isArray(items))
    return errorResponse(c, "items must be an array", 400);

  await Promise.all(
    items.map(({ id, order }) =>
      Project.findByIdAndUpdate(id, { $set: { order } }),
    ),
  );
  return successResponse(c, null, "Order updated");
});

// DELETE /api/projects/:id
projectsRouter.delete("/:id", authMiddleware, async (c) => {
  const project = await Project.findByIdAndDelete(c.req.param("id"));
  if (!project) return errorResponse(c, "Project not found", 404);
  return successResponse(c, null, "Project deleted");
});
