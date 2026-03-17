/**
 * Export sign data from asl-autoblog → asl-practice app data files.
 *
 * Reads: published.json, video_cache.json, asl_lex_data.csv, custom_lex_data.json
 * Outputs: data/signs.json + data/sign-details/[slug].json
 *
 * Usage: npx tsx scripts/export-signs.ts --source ../
 */

import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

// --- CLI args ---
const args = process.argv.slice(2);
const sourceIdx = args.indexOf("--source");
const SOURCE_DIR = sourceIdx !== -1 ? args[sourceIdx + 1] : "..";

// --- Paths ---
const PUBLISHED_PATH = path.join(SOURCE_DIR, "published.json");
const VIDEO_CACHE_PATH = path.join(SOURCE_DIR, "video_cache.json");
const ASL_LEX_CSV_PATH = path.join(SOURCE_DIR, "asl_lex_data.csv");
const CUSTOM_LEX_PATH = path.join(SOURCE_DIR, "custom_lex_data.json");
const OUTPUT_DIR = path.join(__dirname, "..", "data");
const DETAILS_DIR = path.join(OUTPUT_DIR, "sign-details");

// --- Synonym map (ported from asl_lex_loader.py:283-345) ---
const SYNONYM_MAP: Record<string, string> = {
  mom: "mother",
  mama: "mother",
  dad: "father",
  dada: "father",
  daddy: "father",
  grandma: "grandmother",
  hi: "hello",
  goodbye: "bye",
  hola: "hello",
  beautiful: "pretty",
  okay: "ok",
  food: "eat",
  pee: "bathroom",
  potty: "bathroom",
  toilet: "bathroom",
  kids: "children",
  dogs: "dog",
  toys: "toy",
  finished: "finish",
  frustrated: "frustrate",
  sleepy: "sleep",
  thinking: "think",
  surfing: "surf",
  nasty: "dirty",
  phone: "telephone",
  princess: "queen",
  yummy: "delicious",
  dummy: "stupid",
  idiot: "stupid",
  loser: "lose",
  female: "woman",
  she: "girl",
  goofy: "silly",
  shut: "close",
  snack: "eat",
  meow: "cat",
  boo: "scared",
  names: "name",
  words: "word",
  sentences: "sentence",
  chinese: "china",
  asian: "asia",
  abc: "alphabet",
  abcs: "alphabet",
  "global warming": "environment",
  this: "this/it",
  watermelon: "melon",
  shit: "bullshit",
  taco: "eat",
  stuff: "many",
  cuss: "bullshit",
  annoying: "bother",
  moron: "stupid",
  stfu: "quiet",
  dumbass: "stupid",
  jesus: "church",
  ass: "bottom",
  whore: "bad",
  slut: "bad",
  cunt: "bad",
  asshole: "bad",
};

const STOP_WORDS = new Set([
  "a", "an", "the", "i", "me", "my", "you", "your", "we", "us",
  "he", "she", "it", "is", "am", "are", "was", "in", "on", "to",
  "of", "for", "and", "or", "do", "does", "did", "have", "has",
  "that", "this", "what", "how", "let", "can", "will", "be",
]);

// --- Helpers ---
function cleanGloss(lemmaId: string): string {
  const cleaned = lemmaId.replace(/_(\d+)$/, "").replace(/_/g, " ").trim();
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function safeFloat(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function safeInt(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function safeBool(val: string | undefined): boolean | null {
  if (!val || val.trim() === "") return null;
  const v = val.trim().toUpperCase();
  if (v === "1" || v === "TRUE" || v === "YES") return true;
  if (v === "0" || v === "FALSE" || v === "NO") return false;
  return null;
}

function frequencyLabel(freq: number): string {
  if (freq >= 6) return "Very Common";
  if (freq >= 4.5) return "Common";
  if (freq >= 3) return "Moderate";
  if (freq >= 2) return "Uncommon";
  return "Rare";
}

function iconicityLabel(score: number): string {
  if (score >= 5) return "Highly Iconic";
  if (score >= 3) return "Moderately Iconic";
  return "Arbitrary";
}

function signTypeReadable(raw: string): string {
  const mapping: Record<string, string> = {
    OneHanded: "One-Handed",
    "TwoHanded-Same": "Two-Handed (Symmetrical)",
    "TwoHanded-Different": "Two-Handed (Asymmetrical)",
  };
  return mapping[raw] || raw.replace(/_/g, " ");
}

function aoaLabel(months: number): string {
  if (months < 24) return "Early Learner (under 2 years)";
  if (months < 36) return "Toddler (2-3 years)";
  if (months < 48) return "Preschool (3-4 years)";
  if (months < 72) return "School Age (4-6 years)";
  return "Later Learner (6+ years)";
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function difficultyFromFreq(freq: number | null): 1 | 2 | 3 {
  if (freq === null) return 2;
  if (freq >= 5) return 1; // easy (common)
  if (freq >= 3) return 2; // medium
  return 3; // hard (rare)
}

const MOVEMENT_MAP: Record<string, string> = {
  BackAndForth: "Back and Forth",
  "X-shaped": "X-Shaped",
  "Z-shaped": "Z-Shaped",
};

// --- Build ASL-LEX lookup ---
interface LexEntry {
  coreWord: string;
  frequency: number | null;
  frequencyLabel: string | null;
  iconicity: number | null;
  iconicityLabel: string | null;
  iconicityType: string | null;
  lexicalClass: string | null;
  signType: string | null;
  handshape: string | null;
  selectedFingers: string | null;
  flexion: string | null;
  flexionChange: string | null;
  spread: string | null;
  movement: string | null;
  repeatedMovement: string | null;
  majorLocation: string | null;
  minorLocation: string | null;
  secondMinorLocation: string | null;
  contact: string | null;
  nonDominantHandshape: string | null;
  ulnarRotation: string | null;
  thumbPosition: string | null;
  thumbContact: string | null;
  isCompound: boolean | null;
  numMorphemes: number | null;
  ageOfAcquisition: number | null;
  aoaLabel: string | null;
  neighborhoodDensity: number | null;
  semanticField: string | null;
  signBankTranslations: string | null;
  signBankId: string | null;
}

function buildLexLookup(csvPath: string): Map<string, LexEntry> {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const entries = new Map<string, LexEntry>();

  for (const row of records) {
    const lemmaId = (row["LemmaID"] || "").trim();
    if (!lemmaId) continue;

    const coreWord = cleanGloss(lemmaId);
    if (!coreWord) continue;

    const freq = safeFloat(row["SignFrequency(M)"]);
    const icon = safeFloat(row["Iconicity(M)"]);
    const aoa = safeFloat(row["bglm_aoa"]);
    const signTypeRaw = (row["SignType.2.0"] || "").trim();
    const movementRaw = (row["Movement.2.0"] || "").trim();
    const semField = (row["SignBankSemanticField"] || "").trim();
    const sbId = (row["SignBankReferenceID"] || "").trim();
    const sbTranslations = (row["SignBankEnglishTranslations"] || "").trim();

    const entry: LexEntry = {
      coreWord,
      frequency: freq,
      frequencyLabel: freq !== null ? frequencyLabel(freq) : null,
      iconicity: icon,
      iconicityLabel: icon !== null ? iconicityLabel(icon) : null,
      iconicityType: (row["IconicityType"] || "").trim() || null,
      lexicalClass: (row["LexicalClass"] || "").trim() || null,
      signType: signTypeRaw ? signTypeReadable(signTypeRaw) : null,
      handshape: (row["Handshape.2.0"] || "").trim() || null,
      selectedFingers: (row["SelectedFingers.2.0"] || "").trim() || null,
      flexion: (row["Flexion.2.0"] || "").trim() || null,
      flexionChange: (row["FlexionChange.2.0"] || "").trim() || null,
      spread: (row["Spread.2.0"] || "").trim() || null,
      movement: movementRaw
        ? MOVEMENT_MAP[movementRaw] || movementRaw
        : null,
      repeatedMovement: (row["RepeatedMovement.2.0"] || "").trim() || null,
      majorLocation: (row["MajorLocation.2.0"] || "").trim() || null,
      minorLocation: (row["MinorLocation.2.0"] || "").trim() || null,
      secondMinorLocation:
        (row["SecondMinorLocation.2.0"] || "").trim() || null,
      contact: (row["Contact.2.0"] || "").trim() || null,
      nonDominantHandshape:
        (row["NonDominantHandshape.2.0"] || "").trim() || null,
      ulnarRotation: (row["UlnarRotation.2.0"] || "").trim() || null,
      thumbPosition: (row["ThumbPosition.2.0"] || "").trim() || null,
      thumbContact: (row["ThumbContact.2.0"] || "").trim() || null,
      isCompound: safeBool(row["Compound.2.0"]),
      numMorphemes: safeInt(row["NumberOfMorphemes.2.0"]),
      ageOfAcquisition: aoa !== null ? Math.round(aoa) : null,
      aoaLabel: aoa !== null ? aoaLabel(aoa) : null,
      neighborhoodDensity: safeInt(row["Neighborhood Density 2.0"]),
      semanticField:
        semField && semField !== "-" && semField !== "None"
          ? semField
          : null,
      signBankTranslations:
        sbTranslations && sbTranslations !== "-" ? sbTranslations : null,
      signBankId: sbId && sbId !== "-" ? sbId : null,
    };

    const key = coreWord.toLowerCase();
    const existing = entries.get(key);
    if (!existing || (freq || 0) > (existing.frequency || 0)) {
      entries.set(key, entry);
    }
  }

  return entries;
}

// --- Match logic (ported from asl_lex_loader.py:367-428) ---
function getLexMetadata(
  coreWord: string,
  lookup: Map<string, LexEntry>,
  customLex: Record<string, Record<string, unknown>>
): LexEntry | null {
  if (!coreWord) return null;

  const key = coreWord.trim().toLowerCase();

  // Exact match
  const exact = lookup.get(key);
  if (exact) return exact;

  // Synonym mapping
  const synonym = SYNONYM_MAP[key];
  if (synonym) {
    const result = lookup.get(synonym);
    if (result) return result;
  }

  // Depluralize
  if (key.endsWith("s") && key.length > 2) {
    const result = lookup.get(key.slice(0, -1));
    if (result) return result;
  }

  // Multi-word fallback
  const words = key.split(/\s+/);
  if (words.length >= 2) {
    const nonStop = words
      .filter((w) => !STOP_WORDS.has(w))
      .sort((a, b) => b.length - a.length);
    const candidates = [...nonStop, ...words.filter((w) => STOP_WORDS.has(w))];

    for (const word of candidates) {
      const result = lookup.get(word);
      if (result) return result;
    }
    for (const word of candidates) {
      const syn = SYNONYM_MAP[word];
      if (syn) {
        const result = lookup.get(syn);
        if (result) return result;
      }
    }
  }

  // Custom lex fallback
  const custom = customLex[key];
  if (custom) {
    return {
      coreWord: (custom.core_word as string) || coreWord,
      frequency: (custom.frequency as number) ?? null,
      frequencyLabel: (custom.frequency_label as string) ?? null,
      iconicity: (custom.iconicity as number) ?? null,
      iconicityLabel: (custom.iconicity_label as string) ?? null,
      iconicityType: (custom.iconicity_type as string) ?? null,
      lexicalClass: (custom.lexical_class as string) ?? null,
      signType: (custom.sign_type as string) ?? null,
      handshape: (custom.handshape as string) ?? null,
      selectedFingers: null,
      flexion: null,
      flexionChange: null,
      spread: null,
      movement: (custom.movement as string) ?? null,
      repeatedMovement: null,
      majorLocation: (custom.major_location as string) ?? null,
      minorLocation: null,
      secondMinorLocation: null,
      contact: null,
      nonDominantHandshape: null,
      ulnarRotation: null,
      thumbPosition: null,
      thumbContact: null,
      isCompound: (custom.is_compound as boolean) ?? null,
      numMorphemes: (custom.num_morphemes as number) ?? null,
      ageOfAcquisition: (custom.age_of_acquisition as number) ?? null,
      aoaLabel: (custom.aoa_label as string) ?? null,
      neighborhoodDensity: (custom.neighborhood_density as number) ?? null,
      semanticField: (custom.semantic_field as string) ?? null,
      signBankTranslations: null,
      signBankId: (custom.signbank_id as string) ?? null,
    };
  }

  return null;
}

// --- Extract core word from published.json keyword ---
function extractCoreWord(keyword: string): string {
  // Published keys are like "sign language thank you" → core word is "thank you"
  // Or just "hello" → "hello"
  return keyword
    .replace(/^sign language\s+/i, "")
    .replace(/\s+in sign language$/i, "")
    .trim();
}

// --- Main ---
function main() {
  console.log(`Source dir: ${path.resolve(SOURCE_DIR)}`);

  // Load source data
  const published: Record<
    string,
    { status: string; url: string; type: string; title: string; _keyword: string }
  > = JSON.parse(fs.readFileSync(PUBLISHED_PATH, "utf-8"));

  const videoCache: Record<string, string> = JSON.parse(
    fs.readFileSync(VIDEO_CACHE_PATH, "utf-8")
  );

  const customLexRaw: Record<string, Record<string, unknown>> = JSON.parse(
    fs.readFileSync(CUSTOM_LEX_PATH, "utf-8")
  );
  // Remove non-entry keys
  const customLex: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(customLexRaw)) {
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      customLex[k] = v;
    }
  }

  console.log("Building ASL-LEX lookup...");
  const lexLookup = buildLexLookup(ASL_LEX_CSV_PATH);
  console.log(`  ${lexLookup.size} entries in ASL-LEX lookup`);

  // Filter dictionary entries
  const dictEntries = Object.entries(published).filter(
    ([, entry]) => entry.status === "published" && entry.type === "dictionary"
  );
  console.log(`  ${dictEntries.length} published dictionary entries`);

  // Ensure output dirs
  fs.mkdirSync(DETAILS_DIR, { recursive: true });

  const catalog: Array<Record<string, unknown>> = [];
  let lexMatches = 0;
  let videoMatches = 0;

  for (const [keyword, entry] of dictEntries) {
    const coreWord = extractCoreWord(keyword);
    const slug = toSlug(coreWord);
    if (!slug) continue;

    // Look up video
    const videoId = videoCache[coreWord] || videoCache[keyword] || null;
    if (videoId) videoMatches++;

    // Look up ASL-LEX data
    const lex = getLexMetadata(coreWord, lexLookup, customLex);
    if (lex) lexMatches++;

    // Build catalog entry
    const catalogEntry = {
      slug,
      name: coreWord
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      videoId,
      blogUrl: entry.url,
      semanticField: lex?.semanticField ?? null,
      lexicalClass: lex?.lexicalClass ?? null,
      difficulty: difficultyFromFreq(lex?.frequency ?? null),
      signType: lex?.signType ?? null,
      frequency: lex?.frequency ?? null,
      frequencyLabel: lex?.frequencyLabel ?? null,
      hasLexData: lex !== null,
    };
    catalog.push(catalogEntry);

    // Build detail entry
    const detail = {
      ...catalogEntry,
      handshape: lex?.handshape ?? null,
      selectedFingers: lex?.selectedFingers ?? null,
      flexion: lex?.flexion ?? null,
      flexionChange: lex?.flexionChange ?? null,
      spread: lex?.spread ?? null,
      movement: lex?.movement ?? null,
      repeatedMovement: lex?.repeatedMovement ?? null,
      majorLocation: lex?.majorLocation ?? null,
      minorLocation: lex?.minorLocation ?? null,
      secondMinorLocation: lex?.secondMinorLocation ?? null,
      contact: lex?.contact ?? null,
      nonDominantHandshape: lex?.nonDominantHandshape ?? null,
      ulnarRotation: lex?.ulnarRotation ?? null,
      thumbPosition: lex?.thumbPosition ?? null,
      thumbContact: lex?.thumbContact ?? null,
      iconicity: lex?.iconicity ?? null,
      iconicityLabel: lex?.iconicityLabel ?? null,
      iconicityType: lex?.iconicityType ?? null,
      isCompound: lex?.isCompound ?? null,
      numMorphemes: lex?.numMorphemes ?? null,
      ageOfAcquisition: lex?.ageOfAcquisition ?? null,
      aoaLabel: lex?.aoaLabel ?? null,
      neighborhoodDensity: lex?.neighborhoodDensity ?? null,
      signBankTranslations: lex?.signBankTranslations ?? null,
      signBankId: lex?.signBankId ?? null,
    };

    fs.writeFileSync(
      path.join(DETAILS_DIR, `${slug}.json`),
      JSON.stringify(detail, null, 2)
    );
  }

  // Sort catalog by frequency (most common first), nulls last
  catalog.sort((a, b) => {
    const fa = (a.frequency as number) ?? -1;
    const fb = (b.frequency as number) ?? -1;
    return fb - fa;
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "signs.json"),
    JSON.stringify(catalog, null, 2)
  );

  console.log(`\nExport complete:`);
  console.log(`  ${catalog.length} signs in catalog`);
  console.log(`  ${lexMatches} with ASL-LEX data (${((lexMatches / catalog.length) * 100).toFixed(1)}%)`);
  console.log(`  ${videoMatches} with video (${((videoMatches / catalog.length) * 100).toFixed(1)}%)`);
  console.log(`  Output: ${OUTPUT_DIR}/signs.json + ${DETAILS_DIR}/`);
}

main();
