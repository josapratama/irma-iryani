import { Profile } from "../models/Profile";
import { createRouter } from "../config/hono.types";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../utils/validate";
import { successResponse, errorResponse } from "../utils/response";
import { updateProfileSchema } from "../schemas/profile.schema";

export const profileRouter = createRouter();

const defaultProfileData = {
  name: "Irma Iryani",
  greeting: { id: "Halo, saya", en: "Hello, I'm", ja: "こんにちは、" },
  title: {
    id: "Lulusan S1 Pendidikan Kimia",
    en: "Chemistry Education Graduate",
    ja: "化学教育学士",
  },
  subtitle: {
    id: "Analitis · Terstruktur · Berorientasi Solusi",
    en: "Analytical · Structured · Solution-Oriented",
    ja: "分析的 · 構造化 · ソリューション志向",
  },
  description: {
    id: "Lulusan Universitas Sriwijaya dengan IPK 3,90. Terbiasa bekerja terstruktur, teliti mengolah data, dan berkomitmen mengembangkan kompetensi secara profesional.",
    en: "Graduate of Sriwijaya University with GPA 3.90. Accustomed to structured work, meticulous in data processing, and committed to professionally developing competencies.",
    ja: "スリウィジャヤ大学卒業、GPA 3.90。構造化された作業に慣れ、几帳面なデータ処理を行い、専門的に能力を開発することに取り組んでいます。",
  },
  location: "Prabumulih, Sumatera Selatan",
  email: "irmairyani698@gmail.com",
  phone: "0887437204107",
  photoUrl: "/profile.jpg",
  gpa: "3,90",
  degreeBadge: "S1 Kim. Pendidikan",
  universityBadge: "Universitas Sriwijaya",
  cvItems: [
    {
      label: "CV Asisten Statistisi",
      url: "/curriculum-vitae/bps-asisten-statistisi.pdf",
      description: "Fokus pada pengolahan, validasi, dan penyusunan publikasi data statistik.",
    },
    {
      label: "CV Administrasi",
      url: "/curriculum-vitae/administrasi.pdf",
      description: "Fokus pada pengarsipan dokumen, korespondensi, dan operasional perkantoran.",
    },
    {
      label: "CV Pendidik / Guru",
      url: "/curriculum-vitae/pendidik-guru.pdf",
      description: "Fokus pada perencanaan pembelajaran, pengajaran kimia, dan asesmen evaluasi.",
    },
  ],
  socialLinks: [
    {
      name: "Facebook",
      url: "https://facebook.com/Irma Iryani",
      label: "Facebook Irma Iryani",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/ynii_ir2",
      label: "Instagram @ynii_ir2",
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@lynne_29",
      label: "TikTok @lynne_29",
    },
  ],
  aboutTag: { id: "Tentang Saya", en: "About Me", ja: "私について" },
  aboutTitle: { id: "Profil Singkat", en: "Brief Profile", ja: "簡単なプロフィール" },
  aboutBio: {
    id: "Saya merupakan lulusan S1 Pendidikan Kimia Universitas Sriwijaya dengan IPK 3,90. Memiliki ketertarikan tinggi pada analisis data, administrasi profesional, dan pengembangan sistem kerja yang efisien.",
    en: "I am a Bachelor of Chemistry Education graduate from Sriwijaya University with a GPA of 3.90. Highly interested in data analysis, professional administration, and developing efficient work systems.",
    ja: "私はスリウィジャヤ大学化学教育学士の卒業生で、GPAは3.90です。データ分析、専門的な管理、効率的な作業システムの開発に強い関心を持っています。",
  },
  aboutHighlights: [
    { label: { id: "IPK", en: "GPA", ja: "GPA" }, value: "3,90" },
    { label: { id: "Universitas", en: "University", ja: "大学" }, value: "UNSRI" },
    { label: { id: "Jurusan", en: "Major", ja: "専攻" }, value: "Pend. Kimia" },
    { label: { id: "Angkatan", en: "Batch", ja: "入学年" }, value: "2022" },
  ],
  aboutTraits: [
    { id: "Analitis", en: "Analytical", ja: "分析的" },
    { id: "Teliti", en: "Meticulous", ja: "几帳面" },
    { id: "Terstruktur", en: "Structured", ja: "構造化" },
    { id: "Adaptif", en: "Adaptive", ja: "適応力" },
    { id: "Kolaboratif", en: "Collaborative", ja: "協力的" },
    { id: "Sistematis", en: "Systematic", ja: "体系的" },
  ],
  contactSubtitle: {
    id: "Terbuka untuk peluang kerja, kolaborasi, atau sekadar berdiskusi.",
    en: "Open to job opportunities, collaborations, or just having a conversation.",
    ja: "仕事の機会、コラボレーション、またはカジュアルな会話を歓迎します。",
  },
  footerText: {
    id: "Dibuat dengan cinta oleh Irma Iryani",
    en: "Crafted with care by Irma Iryani",
    ja: "イルマ・イリヤニによって作成されました",
  },
};

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/profile
profileRouter.get("/", async (c) => {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = await Profile.create(defaultProfileData);
  }
  return successResponse(c, profile);
});

// ── Admin (protected) ──────────────────────────────────────────────────────

// PUT /api/profile
profileRouter.put("/", authMiddleware, async (c) => {
  const body = await validate(c, updateProfileSchema);
  if (!body) return;

  let profile = await Profile.findOne();
  if (!profile) {
    profile = await Profile.create({ ...defaultProfileData, ...body });
  } else {
    profile = await Profile.findByIdAndUpdate(
      profile._id,
      { $set: body },
      { new: true, runValidators: true }
    );
  }

  return successResponse(c, profile, "Profile successfully updated");
});
