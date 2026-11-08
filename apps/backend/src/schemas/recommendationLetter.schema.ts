import { z } from "zod";

export const createRecommendationLetterSchema = z.object({
  title: z.object({
    id: z.string().min(1),
    en: z.string().min(1),
  }),
  issuer: z.string().min(1).max(200),
  date: z.string().min(1),
  pages: z.array(z.string().min(1)).min(1, "At least one page image is required"),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateRecommendationLetterSchema = createRecommendationLetterSchema.partial();

export type CreateRecommendationLetterDto = z.infer<typeof createRecommendationLetterSchema>;
export type UpdateRecommendationLetterDto = z.infer<typeof updateRecommendationLetterSchema>;
