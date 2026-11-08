"use client";

import { api, Certificate } from "@/lib/api";
import { useApiData } from "./useApiData";

export function useCertificates(category?: string) {
  return useApiData<Certificate[]>(
    () => api.getCertificates(category),
    [category]
  );
}
