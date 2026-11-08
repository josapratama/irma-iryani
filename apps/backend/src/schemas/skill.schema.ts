import { z } from "zod";

export const skillItemSchema = z.object({
  name: z.string().min(1).max(100),
  level: z.number().int().min(0).max(100),
});

export const createSkillGroupSchema = z.object({
  category: z.enum(["hard", "soft", "language"]),
  label: z.object({
    id: z.string().min(1),
    en: z.string().min(1),
  }),
  items: z.array(skillItemSchema).default([]),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateSkillGroupSchema = createSkillGroupSchema.partial();

// Untuk patch satu item skill saja
export const addSkillItemSchema = skillItemSchema;
export const updateSkillItemSchema = skillItemSchema.partial();

export type CreateSkillGroupDto = z.infer<typeof createSkillGroupSchema>;
export type UpdateSkillGroupDto = z.infer<typeof updateSkillGroupSchema>;
export type SkillItemDto = z.infer<typeof skillItemSchema>;
