"use client";

import { api, RecommendationLetter } from "@/lib/api";
import { useApiData } from "./useApiData";

export function useRecommendationLetters() {
  return useApiData<RecommendationLetter[]>(
    () => api.getRecommendationLetters()
  );
}
