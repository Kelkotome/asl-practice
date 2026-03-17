import Fuse from "fuse.js";
import type { SignCatalogEntry, SignDetail } from "./types";

let _catalog: SignCatalogEntry[] | null = null;
let _fuse: Fuse<SignCatalogEntry> | null = null;

export async function loadCatalog(): Promise<SignCatalogEntry[]> {
  if (_catalog) return _catalog;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/data/signs.json`);
  _catalog = (await res.json()) as SignCatalogEntry[];
  return _catalog;
}

export function setCatalog(data: SignCatalogEntry[]) {
  _catalog = data;
  _fuse = null;
}

function getFuse(catalog: SignCatalogEntry[]): Fuse<SignCatalogEntry> {
  if (_fuse) return _fuse;
  _fuse = new Fuse(catalog, {
    keys: [
      { name: "name", weight: 2 },
      { name: "semanticField", weight: 1 },
      { name: "lexicalClass", weight: 0.5 },
    ],
    threshold: 0.3,
    includeScore: true,
  });
  return _fuse;
}

export function searchSigns(
  catalog: SignCatalogEntry[],
  query: string
): SignCatalogEntry[] {
  if (!query.trim()) return catalog;
  const fuse = getFuse(catalog);
  return fuse.search(query, { limit: 50 }).map((r) => r.item);
}

export function filterSigns(
  signs: SignCatalogEntry[],
  filters: {
    semanticField?: string;
    difficulty?: number;
    hasVideo?: boolean;
  }
): SignCatalogEntry[] {
  return signs.filter((s) => {
    if (filters.semanticField && s.semanticField !== filters.semanticField)
      return false;
    if (filters.difficulty && s.difficulty !== filters.difficulty) return false;
    if (filters.hasVideo && !s.videoId) return false;
    return true;
  });
}

export function getSemanticFields(catalog: SignCatalogEntry[]): string[] {
  const fields = new Set<string>();
  for (const s of catalog) {
    if (s.semanticField) fields.add(s.semanticField);
  }
  return Array.from(fields).sort();
}

/** Load full detail for a sign (server-side or client-side) */
export async function loadSignDetail(slug: string): Promise<SignDetail | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/data/sign-details/${slug}.json`
    );
    if (!res.ok) return null;
    return (await res.json()) as SignDetail;
  } catch {
    return null;
  }
}
