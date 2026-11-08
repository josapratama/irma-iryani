import mongoose, { Document, Schema } from "mongoose";

export interface ICertificate extends Document {
  title: { id: string; en: string };
  issuer: string;
  date: string;
  score?: string;
  category: "Technology" | "Professional" | "Soft Skills" | "Data" | "Organization";
  images: string[];
  pdfPath?: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    title: {
      id: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    issuer: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    score: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["Technology", "Professional", "Soft Skills", "Data", "Organization"],
    },
    images: { type: [String], default: [] },
    pdfPath: { type: String },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CertificateSchema.index({ category: 1 });
CertificateSchema.index({ order: 1 });

export const Certificate = mongoose.model<ICertificate>("Certificate", CertificateSchema);
