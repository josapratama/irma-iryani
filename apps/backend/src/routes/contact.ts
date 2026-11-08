import { Contact } from "../models/Contact";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { contactRateLimit } from "../middleware/rateLimit";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import { sendContactEmail } from "../utils/mailer";
import {
  createContactSchema,
  updateContactStatusSchema,
} from "../schemas/contact.schema";

export const contactRouter = createRouter();

// ── Public ─────────────────────────────────────────────────────────────────

// POST /api/contact — kirim pesan (rate limited: 5 per IP per 15 menit)
contactRouter.post("/", contactRateLimit, async (c) => {
  const body = await validate(c, createContactSchema);
  if (!body) return;

  // Simpan ke database
  const ipAddress =
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
    c.req.header("x-real-ip") ??
    "unknown";

  const contact = await Contact.create({ ...body, ipAddress });

  // Kirim email (non-blocking — gagal email tidak gagalkan request)
  sendContactEmail(body).catch((err) =>
    console.error("Failed to send contact email:", err),
  );

  return successResponse(
    c,
    { id: contact._id },
    "Pesan Anda telah terkirim! Terima kasih telah menghubungi saya.",
    201,
  );
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// GET /api/contact — semua pesan dengan pagination
contactRouter.get("/", authMiddleware, async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? 20)));
  const status = c.req.query("status");

  const filter: Record<string, unknown> = {};
  if (status && ["unread", "read", "replied"].includes(status)) {
    filter.status = status;
  }

  const [data, total] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Contact.countDocuments(filter),
  ]);

  return successResponse(c, {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/contact/stats — ringkasan jumlah per status
contactRouter.get("/stats", authMiddleware, async (c) => {
  const [unread, read, replied, total] = await Promise.all([
    Contact.countDocuments({ status: "unread" }),
    Contact.countDocuments({ status: "read" }),
    Contact.countDocuments({ status: "replied" }),
    Contact.countDocuments(),
  ]);

  return successResponse(c, { unread, read, replied, total });
});

// GET /api/contact/:id
contactRouter.get("/:id", authMiddleware, async (c) => {
  const contact = await Contact.findById(c.req.param("id"));
  if (!contact) return errorResponse(c, "Message not found", 404);

  // Auto-mark as read saat dibuka
  if (contact.status === "unread") {
    contact.status = "read";
    await contact.save();
  }

  return successResponse(c, contact);
});

// PATCH /api/contact/:id/status
contactRouter.patch("/:id/status", authMiddleware, async (c) => {
  const body = await validate(c, updateContactStatusSchema);
  if (!body) return;

  const contact = await Contact.findByIdAndUpdate(
    c.req.param("id"),
    { $set: { status: body.status } },
    { new: true },
  );
  if (!contact) return errorResponse(c, "Message not found", 404);
  return successResponse(c, contact, "Status updated");
});

// DELETE /api/contact/bulk — hapus banyak sekaligus
// ⚠️ HARUS sebelum /:id agar Hono tidak salah match "bulk" sebagai ID
contactRouter.delete("/bulk", authMiddleware, async (c) => {
  const { ids } = (await c.req.json()) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0)
    return errorResponse(c, "ids must be a non-empty array", 400);

  const result = await Contact.deleteMany({ _id: { $in: ids } });
  return successResponse(
    c,
    { deleted: result.deletedCount },
    "Messages deleted",
  );
});

// DELETE /api/contact/:id
contactRouter.delete("/:id", authMiddleware, async (c) => {
  const contact = await Contact.findByIdAndDelete(c.req.param("id"));
  if (!contact) return errorResponse(c, "Message not found", 404);
  return successResponse(c, null, "Message deleted");
});
