const STORAGE_KEY = "asl-practice-favorites";

export function getFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function toggleFavorite(slug: string): boolean {
  const favorites = getFavorites();
  if (favorites.has(slug)) {
    favorites.delete(slug);
  } else {
    favorites.add(slug);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // localStorage full or unavailable
  }
  return favorites.has(slug);
}

export function isFavorite(slug: string): boolean {
  return getFavorites().has(slug);
}
