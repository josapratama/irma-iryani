import { z } from "zod";

const bilingualSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1),
  ja: z.string().optional().default(""),
});

const bilingualOptionalSchema = z.object({
  id: z.string().optional().default(""),
  en: z.string().optional().default(""),
  ja: z.string().optional().default(""),
});

export const createEducationSchema = z.object({
  degree: bilingualSchema,
  university: bilingualSchema,
  period: bilingualSchema,
  gpa: z.string().default("3,90"),
  description: bilingualOptionalSchema.optional().default({ id: "", en: "", ja: "" }),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateEducationSchema = createEducationSchema.partial();

export type CreateEducationDto = z.infer<typeof createEducationSchema>;
export type UpdateEducationDto = z.infer<typeof updateEducationSchema>;
