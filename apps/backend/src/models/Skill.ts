import mongoose, { Document, Schema } from "mongoose";

interface ISkillItem {
  name: string;
  level: number; // 0-100
}

export interface ISkillGroup extends Document {
  category: "hard" | "soft" | "language";
  label: { id: string; en: string };
  items: ISkillItem[];
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillItemSchema = new Schema<ISkillItem>(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const SkillGroupSchema = new Schema<ISkillGroup>(
  {
    category: {
      type: String,
      required: true,
      enum: ["hard", "soft", "language"],
    },
    label: {
      id: { type: String, required: true },
      en: { type: String, required: true },
    },
    items: { type: [SkillItemSchema], default: [] },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

SkillGroupSchema.index({ category: 1, order: 1 });

export const SkillGroup = mongoose.model<ISkillGroup>(
  "SkillGroup",
  SkillGroupSchema,
);
