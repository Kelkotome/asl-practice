import type { SignCatalogEntry } from "./types";

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function getSignOfTheDay(catalog: SignCatalogEntry[]): SignCatalogEntry | null {
  const eligible = catalog
    .filter((s) => s.videoId && s.hasLexData)
    .sort((a, b) => a.slug.localeCompare(b.slug));

  if (eligible.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  const index = hashDate(today) % eligible.length;
  return eligible[index];
}
