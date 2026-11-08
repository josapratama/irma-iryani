import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["unread", "read", "replied"]),
});

export type CreateContactDto = z.infer<typeof createContactSchema>;
export type UpdateContactStatusDto = z.infer<typeof updateContactStatusSchema>;
