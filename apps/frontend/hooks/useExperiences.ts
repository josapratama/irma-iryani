"use client";

import { api, Experience } from "@/lib/api";
import { useApiData } from "./useApiData";

export function useExperiences(type?: "internship" | "organization") {
  return useApiData<Experience[]>(
    () => api.getExperiences(type),
    [type]
  );
}
