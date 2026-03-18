const STORAGE_KEY = "asl-practice-streaks";

export interface StreakData {
  practiceDates: string[];
  currentStreak: number;
  lastComputedDate: string;
}

function todayLocal(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function getStoredData(): StreakData {
  if (typeof window === "undefined") {
    return { practiceDates: [], currentStreak: 0, lastComputedDate: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StreakData;
  } catch {
    // corrupted data
  }
  return { practiceDates: [], currentStreak: 0, lastComputedDate: "" };
}

function saveData(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

function computeStreak(dates: string[], today: string): number {
  if (dates.length === 0) return 0;

  const set = new Set(dates);
  // Start from today or yesterday
  let current = today;
  if (!set.has(current)) {
    // Check yesterday
    const d = new Date(current + "T12:00:00");
    d.setDate(d.getDate() - 1);
    current = d.toLocaleDateString("en-CA");
    if (!set.has(current)) return 0;
  }

  let streak = 0;
  const d = new Date(current + "T12:00:00");
  while (set.has(d.toLocaleDateString("en-CA"))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function recordPracticeDay(): void {
  const data = getStoredData();
  const today = todayLocal();

  if (!data.practiceDates.includes(today)) {
    data.practiceDates.push(today);
    data.practiceDates.sort();
    // Cap at 365 days
    if (data.practiceDates.length > 365) {
      data.practiceDates = data.practiceDates.slice(-365);
    }
  }

  data.currentStreak = computeStreak(data.practiceDates, today);
  data.lastComputedDate = today;
  saveData(data);
}

export function getStreakData(): StreakData {
  const data = getStoredData();
  const today = todayLocal();

  // Recompute if stale
  if (data.lastComputedDate !== today) {
    data.currentStreak = computeStreak(data.practiceDates, today);
    data.lastComputedDate = today;
    saveData(data);
  }

  return data;
}

export function getCurrentStreak(): number {
  return getStreakData().currentStreak;
}

export function hasPracticedToday(): boolean {
  const data = getStoredData();
  return data.practiceDates.includes(todayLocal());
}
