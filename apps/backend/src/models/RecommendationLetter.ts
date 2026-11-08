import mongoose, { Document, Schema } from "mongoose";

export interface IRecommendationLetter extends Document {
  title: { id: string; en: string };
  issuer: string;
  date: string;
  pages: string[]; // array of image paths
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationLetterSchema = new Schema<IRecommendationLetter>(
  {
    title: {
      id: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    issuer: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    pages: { type: [String], required: true },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RecommendationLetterSchema.index({ order: 1 });

export const RecommendationLetter = mongoose.model<IRecommendationLetter>(
  "RecommendationLetter",
  RecommendationLetterSchema
);
