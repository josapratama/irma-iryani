import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
  name: string;
  greeting: { id: string; en: string; ja?: string };
  title: { id: string; en: string; ja?: string };
  subtitle: { id: string; en: string; ja?: string };
  description: { id: string; en: string; ja?: string };
  location: string;
  email: string;
  phone: string;
  photoUrl: string;
  gpa: string;
  degreeBadge: string;
  universityBadge: string;
  cvItems: Array<{
    label: string;
    url: string;
    description?: string;
  }>;
  socialLinks: Array<{
    name: string;
    url: string;
    label?: string;
  }>;
  aboutTag: { id: string; en: string; ja?: string };
  aboutTitle: { id: string; en: string; ja?: string };
  aboutBio: { id: string; en: string; ja?: string };
  aboutHighlights: Array<{
    label: { id: string; en: string; ja?: string };
    value: string;
  }>;
  aboutTraits: Array<{ id: string; en: string; ja?: string }>;
  contactSubtitle: { id: string; en: string; ja?: string };
  footerText: { id: string; en: string; ja?: string };
  createdAt: Date;
  updatedAt: Date;
}

const bilingualSubSchema = {
  id: { type: String, default: "" },
  en: { type: String, default: "" },
  ja: { type: String, default: "" },
};

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, default: "Irma Iryani" },
    greeting: {
      type: bilingualSubSchema,
      default: { id: "Halo, saya", en: "Hello, I'm", ja: "こんにちは、" },
    },
    title: {
      type: bilingualSubSchema,
      default: {
        id: "Lulusan S1 Pendidikan Kimia",
        en: "Chemistry Education Graduate",
        ja: "化学教育学士",
      },
    },
    subtitle: {
      type: bilingualSubSchema,
      default: {
        id: "Analitis · Terstruktur · Berorientasi Solusi",
        en: "Analytical · Structured · Solution-Oriented",
        ja: "分析的 · 構造化 · ソリューション志向",
      },
    },
    description: {
      type: bilingualSubSchema,
      default: {
        id: "Lulusan Universitas Sriwijaya dengan IPK 3,90. Terbiasa bekerja terstruktur, teliti mengolah data, dan berkomitmen mengembangkan kompetensi secara profesional.",
        en: "Graduate of Sriwijaya University with GPA 3.90. Accustomed to structured work, meticulous in data processing, and committed to professionally developing competencies.",
        ja: "スリウィジャヤ大学卒業、GPA 3.90。構造化された作業に慣れ、几帳面なデータ処理を行い、専門的に能力を開発することに取り組んでいます。",
      },
    },
    location: { type: String, default: "Prabumulih, Sumatera Selatan" },
    email: { type: String, default: "irmairyani698@gmail.com" },
    phone: { type: String, default: "0887437204107" },
    photoUrl: { type: String, default: "/profile.jpg" },
    gpa: { type: String, default: "3,90" },
    degreeBadge: { type: String, default: "S1 Kim. Pendidikan" },
    universityBadge: { type: String, default: "Universitas Sriwijaya" },
    cvItems: [
      {
        _id: false,
        label: { type: String, required: true },
        url: { type: String, required: true },
        description: { type: String, default: "" },
      },
    ],
    socialLinks: [
      {
        _id: false,
        name: { type: String, required: true },
        url: { type: String, required: true },
        label: { type: String, default: "" },
      },
    ],
    aboutTag: {
      type: bilingualSubSchema,
      default: { id: "Tentang Saya", en: "About Me", ja: "私について" },
    },
    aboutTitle: {
      type: bilingualSubSchema,
      default: { id: "Profil Singkat", en: "Brief Profile", ja: "簡単なプロフィール" },
    },
    aboutBio: {
      type: bilingualSubSchema,
      default: {
        id: "Saya merupakan lulusan S1 Pendidikan Kimia Universitas Sriwijaya dengan IPK 3,90. Memiliki ketertarikan tinggi pada analisis data, administrasi profesional, dan pengembangan sistem kerja yang efisien.",
        en: "I am a Bachelor of Chemistry Education graduate from Sriwijaya University with a GPA of 3.90. Highly interested in data analysis, professional administration, and developing efficient work systems.",
        ja: "私はスリウィジャヤ大学化学教育学士の卒業生で、GPAは3.90です。データ分析、専門的な管理、効率的な作業システムの開発に強い関心を持っています。",
      },
    },
    aboutHighlights: [
      {
        _id: false,
        label: bilingualSubSchema,
        value: { type: String, required: true },
      },
    ],
    aboutTraits: [
      {
        _id: false,
        id: { type: String, default: "" },
        en: { type: String, default: "" },
        ja: { type: String, default: "" },
      },
    ],
    contactSubtitle: {
      type: bilingualSubSchema,
      default: {
        id: "Terbuka untuk peluang kerja, kolaborasi, atau sekadar berdiskusi.",
        en: "Open to job opportunities, collaborations, or just having a conversation.",
        ja: "仕事の機会、コラボレーション、またはカジュアルな会話を歓迎します。",
      },
    },
    footerText: {
      type: bilingualSubSchema,
      default: {
        id: "Dibuat dengan cinta oleh Irma Iryani",
        en: "Crafted with care by Irma Iryani",
        ja: "イルマ・イリヤニによって作成されました",
      },
    },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
