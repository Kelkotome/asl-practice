import type { SignCatalogEntry } from "./types";

export function getRelatedSigns(
  sign: SignCatalogEntry & { handshape?: string | null; majorLocation?: string | null },
  catalog: SignCatalogEntry[],
  count = 6
): SignCatalogEntry[] {
  const scored = catalog
    .filter((s) => s.slug !== sign.slug)
    .map((candidate) => {
      let score = 0;

      if (
        sign.semanticField &&
        candidate.semanticField === sign.semanticField
      ) {
        score += 3;
      }

      const candDetail = candidate as SignCatalogEntry & {
        handshape?: string | null;
        majorLocation?: string | null;
      };

      if (sign.handshape && candDetail.handshape === sign.handshape) {
        score += 2;
      }

      if (sign.difficulty === candidate.difficulty) {
        score += 1;
      }

      if (sign.signType && candidate.signType === sign.signType) {
        score += 1;
      }

      return { sign: candidate, score };
    })
    .filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.sign);
}
