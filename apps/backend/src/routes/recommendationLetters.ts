import { RecommendationLetter } from "../models/RecommendationLetter";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import {
  createRecommendationLetterSchema,
  updateRecommendationLetterSchema,
} from "../schemas/recommendationLetter.schema";

export const recommendationLettersRouter = createRouter();

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/recommendation-letters
recommendationLettersRouter.get("/", async (c) => {
  const data = await RecommendationLetter.find({ isVisible: true }).sort({
    order: 1,
  });
  return successResponse(c, data);
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// GET /api/recommendation-letters/admin/all
// ⚠️ HARUS sebelum /:id
recommendationLettersRouter.get("/admin/all", authMiddleware, async (c) => {
  const data = await RecommendationLetter.find().sort({ order: 1 });
  return successResponse(c, data);
});

// GET /api/recommendation-letters/:id
recommendationLettersRouter.get("/:id", async (c) => {
  const letter = await RecommendationLetter.findById(c.req.param("id"));
  if (!letter) return errorResponse(c, "Recommendation letter not found", 404);
  return successResponse(c, letter);
});

// POST /api/recommendation-letters
recommendationLettersRouter.post("/", authMiddleware, async (c) => {
  const body = await validate(c, createRecommendationLetterSchema);
  if (!body) return;

  const letter = await RecommendationLetter.create(body);
  return successResponse(c, letter, "Recommendation letter created", 201);
});

// PUT /api/recommendation-letters/:id
recommendationLettersRouter.put("/:id", authMiddleware, async (c) => {
  const body = await validate(c, updateRecommendationLetterSchema);
  if (!body) return;

  const letter = await RecommendationLetter.findByIdAndUpdate(
    c.req.param("id"),
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!letter) return errorResponse(c, "Recommendation letter not found", 404);
  return successResponse(c, letter, "Recommendation letter updated");
});

// PATCH /api/recommendation-letters/:id/pages — ganti seluruh array pages
recommendationLettersRouter.patch("/:id/pages", authMiddleware, async (c) => {
  const { pages } = await c.req.json();
  if (!Array.isArray(pages) || pages.length === 0)
    return errorResponse(c, "pages must be a non-empty array", 400);

  const letter = await RecommendationLetter.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { pages } },
    { new: true },
  );
  if (!letter) return errorResponse(c, "Recommendation letter not found", 404);
  return successResponse(c, letter, "Pages updated");
});

// PATCH /api/recommendation-letters/:id/visibility
recommendationLettersRouter.patch(
  "/:id/visibility",
  authMiddleware,
  async (c) => {
    const { isVisible } = await c.req.json();
    const letter = await RecommendationLetter.findByIdAndUpdate(
      c.req.param("id"),
      { $set: { isVisible } },
      { new: true },
    );
    if (!letter)
      return errorResponse(c, "Recommendation letter not found", 404);
    return successResponse(c, letter, "Visibility updated");
  },
);

// PATCH /api/recommendation-letters/reorder
recommendationLettersRouter.patch("/reorder", authMiddleware, async (c) => {
  const { items } = (await c.req.json()) as {
    items: { id: string; order: number }[];
  };
  if (!Array.isArray(items))
    return errorResponse(c, "items must be an array", 400);

  await Promise.all(
    items.map(({ id, order }) =>
      RecommendationLetter.findByIdAndUpdate(id, { $set: { order } }),
    ),
  );
  return successResponse(c, null, "Order updated");
});

// DELETE /api/recommendation-letters/:id
recommendationLettersRouter.delete("/:id", authMiddleware, async (c) => {
  const letter = await RecommendationLetter.findByIdAndDelete(
    c.req.param("id"),
  );
  if (!letter) return errorResponse(c, "Recommendation letter not found", 404);
  return successResponse(c, null, "Recommendation letter deleted");
});
