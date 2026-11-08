import { z } from "zod";

const bilingualOptionalSchema = z.object({
  id: z.string().default(""),
  en: z.string().default(""),
  ja: z.string().optional().default(""),
});

const cvItemSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  description: z.string().optional().default(""),
});

const socialLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  label: z.string().optional().default(""),
});

const highlightSchema = z.object({
  label: bilingualOptionalSchema,
  value: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  greeting: bilingualOptionalSchema.optional(),
  title: bilingualOptionalSchema.optional(),
  subtitle: bilingualOptionalSchema.optional(),
  description: bilingualOptionalSchema.optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
  gpa: z.string().optional(),
  degreeBadge: z.string().optional(),
  universityBadge: z.string().optional(),
  cvItems: z.array(cvItemSchema).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  aboutTag: bilingualOptionalSchema.optional(),
  aboutTitle: bilingualOptionalSchema.optional(),
  aboutBio: bilingualOptionalSchema.optional(),
  aboutHighlights: z.array(highlightSchema).optional(),
  aboutTraits: z.array(bilingualOptionalSchema).optional(),
  contactSubtitle: bilingualOptionalSchema.optional(),
  footerText: bilingualOptionalSchema.optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
