import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  title: { id: string; en: string };
  description: { id: string; en: string };
  tags: string[];
  pdfPath: string;
  fileName: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      id: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      id: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    tags: { type: [String], default: [] },
    pdfPath: { type: String, required: true },
    fileName: { type: String, required: true },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ order: 1 });

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
