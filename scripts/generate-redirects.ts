/**
 * Generate redirects for renamed slug URLs.
 *
 * Compares old slugs (toSlug(keyword)) with new slugs (toSlug(extractCoreWord(keyword)))
 * and outputs changed pairs to data/redirects.json.
 *
 * Usage: npx tsx scripts/generate-redirects.ts --source ../
 */

import * as fs from "fs";
import * as path from "path";

// --- CLI args ---
const args = process.argv.slice(2);
const sourceIdx = args.indexOf("--source");
const SOURCE_DIR = sourceIdx !== -1 ? args[sourceIdx + 1] : "..";

// --- Paths ---
const PUBLISHED_PATH = path.join(SOURCE_DIR, "published.json");
const OUTPUT_DIR = path.join(__dirname, "..", "data");
const SIGNS_PATH = path.join(OUTPUT_DIR, "signs.json");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "redirects.json");

// --- Helpers (copied from export-signs.ts) ---
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Current extractCoreWord — strips SEO phrasing from keywords. */
function extractCoreWord(keyword: string): string {
  return keyword
    .replace(/^sign language\s+/i, "")
    .replace(/\s+in\s+(american\s+)?sign language$/i, "")
    .replace(/\s+sign language$/i, "")
    .replace(/^how (to|do you) say\s+/i, "")
    .replace(/^how (to|do you) sign\s+/i, "")
    .replace(/^what is\s+/i, "")
    .replace(/^for\s+/i, "")
    .trim();
}

// --- Main ---
function main() {
  console.log(`Source dir: ${path.resolve(SOURCE_DIR)}`);

  // Load published entries
  const published: Record<
    string,
    { status: string; type: string; [k: string]: unknown }
  > = JSON.parse(fs.readFileSync(PUBLISHED_PATH, "utf-8"));

  // Load current signs.json to validate destinations
  const signs: Array<{ slug: string }> = JSON.parse(
    fs.readFileSync(SIGNS_PATH, "utf-8")
  );
  const validSlugs = new Set(signs.map((s) => s.slug));

  // Filter dictionary entries
  const dictEntries = Object.entries(published).filter(
    ([, entry]) => entry.status === "published" && entry.type === "dictionary"
  );
  console.log(`${dictEntries.length} published dictionary entries`);

  const redirects: Array<{ source: string; destination: string }> = [];
  const seenSources = new Set<string>();
  let skippedNoDestination = 0;
  let skippedSelfRedirect = 0;
  let skippedDuplicate = 0;

  for (const [keyword] of dictEntries) {
    const oldSlug = toSlug(keyword); // Old: slug the raw keyword
    const newSlug = toSlug(extractCoreWord(keyword)); // New: extract core word first

    if (!oldSlug || !newSlug) continue;

    // Skip self-redirects
    if (oldSlug === newSlug) {
      skippedSelfRedirect++;
      continue;
    }

    // Validate destination exists in current signs.json
    if (!validSlugs.has(newSlug)) {
      skippedNoDestination++;
      continue;
    }

    // Deduplicate by source
    if (seenSources.has(oldSlug)) {
      skippedDuplicate++;
      continue;
    }
    seenSources.add(oldSlug);

    redirects.push({ source: oldSlug, destination: newSlug });
  }

  // Sort for stable output
  redirects.sort((a, b) => a.source.localeCompare(b.source));

  // Write output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(redirects, null, 2) + "\n");

  // Summary
  console.log(`\nGenerated ${redirects.length} redirects → ${OUTPUT_PATH}`);
  console.log(`  Skipped: ${skippedSelfRedirect} self-redirects, ${skippedNoDestination} missing destinations, ${skippedDuplicate} duplicates`);

  // Sample
  if (redirects.length > 0) {
    console.log(`\nSample redirects:`);
    for (const r of redirects.slice(0, 10)) {
      console.log(`  /signs/${r.source} → /signs/${r.destination}`);
    }
    if (redirects.length > 10) {
      console.log(`  ... and ${redirects.length - 10} more`);
    }
  }
}

main();
