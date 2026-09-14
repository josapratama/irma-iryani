const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// ─── Generic fetch wrapper ─────────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const { timeoutMs = 10_000, ...fetchInit } = init ?? {};

  // AbortSignal.timeout — drop request if backend doesn't respond in time
  const signal = AbortSignal.timeout(timeoutMs);

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...fetchInit.headers },
    signal,
    ...fetchInit,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `API error ${res.status}`,
    );
  }

  const json = (await res.json()) as { success: boolean; data: T };
  return json.data;
}

// ─── Typed API helpers ─────────────────────────────────────────────────────
export const api = {
  // Certificates
  getCertificates: (category?: string) =>
    apiFetch<Certificate[]>(
      `/certificates${category ? `?category=${category}` : ""}`,
    ),

  // Projects
  getProjects: () => apiFetch<Project[]>("/projects"),

  // Experiences
  getExperiences: (type?: "internship" | "organization") =>
    apiFetch<Experience[]>(`/experiences${type ? `?type=${type}` : ""}`),

  // Skills
  getSkills: (category?: "hard" | "soft") =>
    apiFetch<SkillGroup[]>(`/skills${category ? `?category=${category}` : ""}`),

  // Recommendation Letters
  getRecommendationLetters: () =>
    apiFetch<RecommendationLetter[]>("/recommendation-letters"),

  // Contact
  sendContact: (body: ContactPayload) =>
    apiFetch<{ id: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── Response types (mirror backend models) ────────────────────────────────
export type BilingualText = { id: string; en: string };

export type Certificate = {
  _id: string;
  title: BilingualText;
  issuer: string;
  date: string;
  score?: string;
  category:
    | "Technology"
    | "Professional"
    | "Soft Skills"
    | "Data"
    | "Organization";
  images: string[];
  pdfPath?: string;
  order: number;
};

export type Project = {
  _id: string;
  title: BilingualText;
  description: BilingualText;
  tags: string[];
  pdfPath: string;
  fileName: string;
  order: number;
};

export type SkillItem = { name: string; level: number };

export type SkillGroup = {
  _id: string;
  category: "hard" | "soft";
  label: BilingualText;
  items: SkillItem[];
  order: number;
};

export type ExperiencePoint = { id: string; en: string };

export type OrgEvent = {
  name: BilingualText;
  role: BilingualText;
  period: string;
  points: ExperiencePoint[];
};

export type ExperienceImage = {
  src: string;
  caption: BilingualText;
};

export type Experience = {
  _id: string;
  type: "internship" | "organization";
  title: BilingualText;
  org: string;
  period: string;
  points: ExperiencePoint[];
  events?: OrgEvent[];
  images: ExperienceImage[];
  order: number;
};

export type RecommendationLetter = {
  _id: string;
  title: BilingualText;
  issuer: string;
  date: string;
  pages: string[];
  order: number;
};

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
