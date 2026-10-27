export function getBaseUrl(): string {
  // 1. Explicit environment variable if provided
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (envUrl && envUrl.length > 0 && !envUrl.includes("localhost")) {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
  }

  // 2. In browser: dynamic detection based on current domain
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("josapratama.com")) {
      return "https://irma-backend.josapratama.com/api";
    }
    if (host.endsWith("josapratama.cloud")) {
      return "https://irma-backend.josapratama.cloud/api";
    }
    if (host !== "localhost" && host !== "127.0.0.1") {
      return `${window.location.protocol}//irma-backend.${host}/api`;
    }
  }

  // 3. Fallback
  return "https://irma-backend.josapratama.com/api";
}

/**
 * AbortSignal.timeout polyfill — AbortSignal.timeout tidak tersedia di
 * Safari < 16 dan Chrome < 103. Gunakan AbortController + setTimeout.
 */
function timeoutSignal(ms: number): AbortSignal {
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(
    () =>
      controller.abort(
        new DOMException(
          "The operation was aborted due to timeout",
          "TimeoutError",
        ),
      ),
    ms,
  );
  return controller.signal;
}

// ─── Auth Token helpers ────────────────────────────────────────────────────
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_token", token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_email");
}

export function getAuthEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_email");
}

export function setAuthEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_email", email);
}

// ─── Generic fetch wrapper ─────────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const { timeoutMs = 10_000, ...fetchInit } = init ?? {};
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...fetchInit.headers },
    signal: timeoutSignal(timeoutMs),
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

// ─── Admin fetch wrapper (auto-injects Bearer token) ────────────────────────
export async function adminFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return apiFetch<T>(path, { ...init, headers });
}

// ─── Typed API helpers ─────────────────────────────────────────────────────
export const api = {
  // Public Certificates
  getCertificates: (category?: string) =>
    apiFetch<Certificate[]>(
      `/certificates${category ? `?category=${category}` : ""}`,
    ),

  // Public Projects
  getProjects: () => apiFetch<Project[]>("/projects"),

  // Public Experiences
  getExperiences: (type?: "internship" | "organization") =>
    apiFetch<Experience[]>(`/experiences${type ? `?type=${type}` : ""}`),

  // Public Skills
  getSkills: (category?: "hard" | "soft") =>
    apiFetch<SkillGroup[]>(`/skills${category ? `?category=${category}` : ""}`),

  // Public Recommendation Letters
  getRecommendationLetters: () =>
    apiFetch<RecommendationLetter[]>("/recommendation-letters"),

  // Public Contact
  sendContact: (body: ContactPayload) =>
    apiFetch<{ id: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ─── Admin APIs ──────────────────────────────────────────────────────────
  admin: {
    // Auth
    login: (body: { email: string; password: string }) =>
      apiFetch<{ token: string; email: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    getMe: () => adminFetch<{ email: string }>("/auth/me"),

    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      adminFetch<null>("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),

    // Certificates
    getCertificates: () =>
      adminFetch<Certificate[]>("/certificates/admin/all"),

    createCertificate: (data: Partial<Certificate>) =>
      adminFetch<Certificate>("/certificates", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateCertificate: (id: string, data: Partial<Certificate>) =>
      adminFetch<Certificate>(`/certificates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    toggleCertificateVisibility: (id: string, isVisible: boolean) =>
      adminFetch<Certificate>(`/certificates/${id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible }),
      }),

    deleteCertificate: (id: string) =>
      adminFetch<null>(`/certificates/${id}`, {
        method: "DELETE",
      }),

    // Projects
    getProjects: () => adminFetch<Project[]>("/projects/admin/all"),

    createProject: (data: Partial<Project>) =>
      adminFetch<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateProject: (id: string, data: Partial<Project>) =>
      adminFetch<Project>(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    toggleProjectVisibility: (id: string, isVisible: boolean) =>
      adminFetch<Project>(`/projects/${id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible }),
      }),

    deleteProject: (id: string) =>
      adminFetch<null>(`/projects/${id}`, {
        method: "DELETE",
      }),

    // Experiences
    getExperiences: () =>
      adminFetch<Experience[]>("/experiences/admin/all"),

    createExperience: (data: Partial<Experience>) =>
      adminFetch<Experience>("/experiences", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateExperience: (id: string, data: Partial<Experience>) =>
      adminFetch<Experience>(`/experiences/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    toggleExperienceVisibility: (id: string, isVisible: boolean) =>
      adminFetch<Experience>(`/experiences/${id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible }),
      }),

    deleteExperience: (id: string) =>
      adminFetch<null>(`/experiences/${id}`, {
        method: "DELETE",
      }),

    // Skills
    getSkills: () => adminFetch<SkillGroup[]>("/skills/admin/all"),

    createSkillGroup: (data: Partial<SkillGroup>) =>
      adminFetch<SkillGroup>("/skills", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateSkillGroup: (id: string, data: Partial<SkillGroup>) =>
      adminFetch<SkillGroup>(`/skills/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    addSkillItem: (groupId: string, item: SkillItem) =>
      adminFetch<SkillGroup>(`/skills/${groupId}/items`, {
        method: "POST",
        body: JSON.stringify(item),
      }),

    deleteSkillItem: (groupId: string, index: number) =>
      adminFetch<SkillGroup>(`/skills/${groupId}/items/${index}`, {
        method: "DELETE",
      }),

    toggleSkillGroupVisibility: (id: string, isVisible: boolean) =>
      adminFetch<SkillGroup>(`/skills/${id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible }),
      }),

    deleteSkillGroup: (id: string) =>
      adminFetch<null>(`/skills/${id}`, {
        method: "DELETE",
      }),

    // Recommendation Letters
    getRecommendationLetters: () =>
      adminFetch<RecommendationLetter[]>("/recommendation-letters/admin/all"),

    createRecommendationLetter: (data: Partial<RecommendationLetter>) =>
      adminFetch<RecommendationLetter>("/recommendation-letters", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateRecommendationLetter: (
      id: string,
      data: Partial<RecommendationLetter>,
    ) =>
      adminFetch<RecommendationLetter>(`/recommendation-letters/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    toggleRecommendationLetterVisibility: (id: string, isVisible: boolean) =>
      adminFetch<RecommendationLetter>(
        `/recommendation-letters/${id}/visibility`,
        {
          method: "PATCH",
          body: JSON.stringify({ isVisible }),
        },
      ),

    deleteRecommendationLetter: (id: string) =>
      adminFetch<null>(`/recommendation-letters/${id}`, {
        method: "DELETE",
      }),

    // Contact Messages
    getContacts: (page = 1, limit = 20, status?: string) =>
      adminFetch<ContactResponse>(
        `/contact?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
      ),

    getContactStats: () => adminFetch<ContactStats>("/contact/stats"),

    getContactById: (id: string) => adminFetch<ContactMessage>(`/contact/${id}`),

    updateContactStatus: (
      id: string,
      status: "unread" | "read" | "replied",
    ) =>
      adminFetch<ContactMessage>(`/contact/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    deleteContact: (id: string) =>
      adminFetch<null>(`/contact/${id}`, {
        method: "DELETE",
      }),

    deleteContactsBulk: (ids: string[]) =>
      adminFetch<{ deleted: number }>("/contact/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }),
  },
};

// ─── Response types (mirror backend models) ────────────────────────────────
export type BilingualText = Record<string, string>;

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
  isVisible?: boolean;
};

export type Project = {
  _id: string;
  title: BilingualText;
  description: BilingualText;
  tags: string[];
  pdfPath: string;
  fileName: string;
  order: number;
  isVisible?: boolean;
};

export type SkillItem = { name: string; level: number };

export type SkillGroup = {
  _id: string;
  category: "hard" | "soft" | "language";
  label: BilingualText;
  items: SkillItem[];
  order: number;
  isVisible?: boolean;
};

export type ExperiencePoint = Record<string, string>;

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
  isVisible?: boolean;
};

export type RecommendationLetter = {
  _id: string;
  title: BilingualText;
  issuer: string;
  date: string;
  pages: string[];
  order: number;
  isVisible?: boolean;
};

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactResponse = {
  data: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ContactStats = {
  unread: number;
  read: number;
  replied: number;
  total: number;
};
