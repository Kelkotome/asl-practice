"use client";

import { usePracticeProgress } from "@/lib/progress/hooks";

export function usePathProgress(signSlugs: string[]) {
  const progress = usePracticeProgress();
  const total = signSlugs.length;
  const practiced = signSlugs.filter((slug) => (progress[slug]?.count ?? 0) > 0).length;
  const percentage = total > 0 ? Math.round((practiced / total) * 100) : 0;
  return { total, practiced, percentage };
}
