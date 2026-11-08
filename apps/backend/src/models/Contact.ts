import mongoose, { Document, Schema } from "mongoose";

export type ContactStatus = "unread" | "read" | "replied";

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
    },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

ContactSchema.index({ status: 1, createdAt: -1 });

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);
