const STORAGE_KEY = "asl-practice-onboarding";

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "complete";
  } catch {
    return true;
  }
}

export function completeOnboarding(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "complete");
  } catch {
    // localStorage full or unavailable
  }
}
