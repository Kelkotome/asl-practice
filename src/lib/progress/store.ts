import { recordPracticeDay } from "./streak";

const STORAGE_KEY = "asl-practice-progress";

export interface PracticeRecord {
  slug: string;
  count: number;
  lastPracticed: string; // ISO date string
}

export interface PracticeProgress {
  [slug: string]: PracticeRecord;
}

export function getProgress(): PracticeProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PracticeProgress) : {};
  } catch {
    return {};
  }
}

export function recordPractice(slug: string): void {
  const progress = getProgress();
  const existing = progress[slug];
  progress[slug] = {
    slug,
    count: existing ? existing.count + 1 : 1,
    lastPracticed: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage full or unavailable
  }
  // Record this day for streak tracking
  recordPracticeDay();
}

export function getRecentlyPracticed(limit = 6): PracticeRecord[] {
  const progress = getProgress();
  return Object.values(progress)
    .sort(
      (a, b) =>
        new Date(b.lastPracticed).getTime() -
        new Date(a.lastPracticed).getTime()
    )
    .slice(0, limit);
}
