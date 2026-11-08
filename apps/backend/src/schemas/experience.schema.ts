import { z } from "zod";

const bilingualSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1),
});

const pointSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1),
});

const orgEventSchema = z.object({
  name: bilingualSchema,
  role: bilingualSchema,
  period: z.string().min(1),
  points: z.array(pointSchema).default([]),
});

const imageSchema = z.object({
  src: z.string().min(1),
  caption: bilingualSchema,
});

export const createExperienceSchema = z.object({
  type: z.enum(["internship", "organization"]),
  title: bilingualSchema,
  org: z.string().min(1).max(200),
  period: z.string().min(1),
  points: z.array(pointSchema).default([]),
  events: z.array(orgEventSchema).optional(),
  images: z.array(imageSchema).default([]),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export type CreateExperienceDto = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceDto = z.infer<typeof updateExperienceSchema>;
