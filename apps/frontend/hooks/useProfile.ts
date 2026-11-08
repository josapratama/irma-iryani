"use client";

import { api, ProfileData } from "@/lib/api";
import { useApiData } from "./useApiData";

export function useProfile() {
  return useApiData<ProfileData>(() => api.getProfile());
}
