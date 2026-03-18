"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProgress,
  recordPractice as recordPracticeStore,
  getRecentlyPracticed,
  type PracticeProgress,
  type PracticeRecord,
} from "./store";

export function usePracticeProgress(): PracticeProgress {
  const [progress, setProgress] = useState<PracticeProgress>({});

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return progress;
}

export function useRecordPractice(slug: string): {
  record: () => void;
  count: number;
} {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const progress = getProgress();
    setCount(progress[slug]?.count ?? 0);
  }, [slug]);

  const record = useCallback(() => {
    recordPracticeStore(slug);
    const progress = getProgress();
    setCount(progress[slug]?.count ?? 0);
  }, [slug]);

  return { record, count };
}

export function useRecentlyPracticed(limit = 6): PracticeRecord[] {
  const [recent, setRecent] = useState<PracticeRecord[]>([]);

  useEffect(() => {
    setRecent(getRecentlyPracticed(limit));
  }, [limit]);

  return recent;
}
