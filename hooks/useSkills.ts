"use client";

import { api, SkillGroup } from "@/lib/api";
import { useApiData } from "./useApiData";

export function useSkills(category?: "hard" | "soft") {
  return useApiData<SkillGroup[]>(
    () => api.getSkills(category),
    [category]
  );
}
