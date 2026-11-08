import { z } from "zod";

const bilingualSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1),
});

export const createCertificateSchema = z.object({
  title: bilingualSchema,
  issuer: z.string().min(1).max(200),
  date: z.string().min(1),
  score: z.string().optional(),
  category: z.enum(["Technology", "Professional", "Soft Skills", "Data", "Organization"]),
  images: z.array(z.string()).default([]),
  pdfPath: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateCertificateSchema = createCertificateSchema.partial();

export type CreateCertificateDto = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateDto = z.infer<typeof updateCertificateSchema>;
