"use client";

import { api, EducationItem } from "@/lib/api";
import { useApiData } from "./useApiData";

export function useEducations() {
  return useApiData<EducationItem[]>(() => api.getEducations());
}
