import { z } from "zod";

const bilingualSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1),
});

export const createProjectSchema = z.object({
  title: bilingualSchema,
  description: bilingualSchema,
  tags: z.array(z.string()).default([]),
  pdfPath: z.string().min(1),
  fileName: z.string().min(1),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
