"use client";

import { api, Project } from "@/lib/api";
import { useApiData } from "./useApiData";

export function useProjects() {
  return useApiData<Project[]>(() => api.getProjects());
}
