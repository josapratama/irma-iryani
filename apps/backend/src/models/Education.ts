import mongoose, { Document, Schema } from "mongoose";

export interface IEducation extends Document {
  degree: { id: string; en: string; ja?: string };
  university: { id: string; en: string; ja?: string };
  period: { id: string; en: string; ja?: string };
  gpa: string;
  description?: { id?: string; en?: string; ja?: string };
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bilingualSubSchema = {
  id: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
  ja: { type: String, default: "" },
};

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: bilingualSubSchema, required: true },
    university: { type: bilingualSubSchema, required: true },
    period: { type: bilingualSubSchema, required: true },
    gpa: { type: String, default: "3,90" },
    description: {
      type: {
        id: { type: String, default: "" },
        en: { type: String, default: "" },
        ja: { type: String, default: "" },
      },
      default: { id: "", en: "", ja: "" },
    },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EducationSchema.index({ order: 1 });

export const Education = mongoose.model<IEducation>("Education", EducationSchema);
