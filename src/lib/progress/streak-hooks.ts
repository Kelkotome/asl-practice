"use client";

import { useState, useEffect } from "react";
import { getStreakData, hasPracticedToday, type StreakData } from "./streak";

export function useStreak(): StreakData & { practicedToday: boolean } {
  const [data, setData] = useState<StreakData>({
    practiceDates: [],
    currentStreak: 0,
    lastComputedDate: "",
  });
  const [practicedToday, setPracticedToday] = useState(false);

  useEffect(() => {
    setData(getStreakData());
    setPracticedToday(hasPracticedToday());
  }, []);

  return { ...data, practicedToday };
}
