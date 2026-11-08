import mongoose, { Document, Schema } from "mongoose";

interface IBilingualText {
  id: string;
  en: string;
}

interface IExperienceEntry {
  title: IBilingualText;
  role?: IBilingualText;
  org: string;
  period: string;
  points: { id: string; en: string }[];
}

interface IOrganizationEvent {
  name: IBilingualText;
  role: IBilingualText;
  period: string;
  points: { id: string; en: string }[];
}

export interface IExperience extends Document {
  type: "internship" | "organization";
  title: IBilingualText;
  org: string;
  period: string;
  points: { id: string; en: string }[];
  // hanya untuk org — sub-events (AEC, BIRUNI, dll)
  events?: IOrganizationEvent[];
  images: { src: string; caption: IBilingualText }[];
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BilingualSchema = new Schema<IBilingualText>(
  { id: { type: String, required: true }, en: { type: String, required: true } },
  { _id: false }
);

const PointSchema = new Schema<{ id: string; en: string }>(
  { id: { type: String, required: true }, en: { type: String, required: true } },
  { _id: false }
);

const OrgEventSchema = new Schema<IOrganizationEvent>(
  {
    name: { type: BilingualSchema, required: true },
    role: { type: BilingualSchema, required: true },
    period: { type: String, required: true },
    points: { type: [PointSchema], default: [] },
  },
  { _id: false }
);

const ExperienceSchema = new Schema<IExperience>(
  {
    type: { type: String, required: true, enum: ["internship", "organization"] },
    title: { type: BilingualSchema, required: true },
    org: { type: String, required: true },
    period: { type: String, required: true },
    points: { type: [PointSchema], default: [] },
    events: { type: [OrgEventSchema], default: undefined },
    images: {
      type: [
        {
          src: { type: String, required: true },
          caption: { type: BilingualSchema, required: true },
          _id: false,
        },
      ],
      default: [],
    },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExperienceSchema.index({ type: 1, order: 1 });

export const Experience = mongoose.model<IExperience>("Experience", ExperienceSchema);
