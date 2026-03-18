import type { SignCatalogEntry } from "@/lib/signs/types";
import type { LearningPath } from "./types";

export function resolvePathSigns(
  pathData: LearningPath,
  catalog: SignCatalogEntry[],
): SignCatalogEntry[] {
  const bySlug = new Map(catalog.map((s) => [s.slug, s]));
  return pathData.signSlugs
    .map((slug) => bySlug.get(slug))
    .filter((s): s is SignCatalogEntry => s !== undefined);
}

export function getFeaturedPaths(paths: LearningPath[]): LearningPath[] {
  return paths.filter((p) => p.featured);
}
