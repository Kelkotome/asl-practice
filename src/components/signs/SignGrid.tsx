"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { searchSigns, filterSigns, getSemanticFields } from "@/lib/signs/catalog";
import SignCard from "./SignCard";
import SignSearch from "./SignSearch";
import FavoritesList from "./FavoritesList";
import ContinuePracticing from "@/components/progress/ContinuePracticing";

const PAGE_SIZE = 48;

export default function SignGrid({ catalog }: { catalog: SignCatalogEntry[] }) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [semanticField, setSemanticField] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [page, setPage] = useState(0);

  const semanticFields = useMemo(() => getSemanticFields(catalog), [catalog]);

  const sortedCatalog = useMemo(() => {
    return [...catalog].sort((a, b) => {
      const aIsLetter = /^[A-Z]$/.test(a.name);
      const bIsLetter = /^[A-Z]$/.test(b.name);
      const aIsNumber = /^\d+$/.test(a.name);
      const bIsNumber = /^\d+$/.test(b.name);
      if (aIsLetter && !bIsLetter) return -1;
      if (!aIsLetter && bIsLetter) return 1;
      if (aIsNumber && !bIsNumber) return -1;
      if (!aIsNumber && bIsNumber) return 1;
      if (aIsNumber && bIsNumber) return parseInt(a.name) - parseInt(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [catalog]);

  const results = useMemo(() => {
    let signs = query ? searchSigns(catalog, query) : sortedCatalog;
    signs = filterSigns(signs, {
      semanticField: semanticField || undefined,
      difficulty: difficulty || undefined,
      hasVideo: hasVideo || undefined,
    });
    return signs;
  }, [catalog, sortedCatalog, query, semanticField, difficulty, hasVideo]);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages - 1);
  const pageResults = results.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const jumpLetters = useMemo(() => {
    if (query || semanticField || difficulty || hasVideo) return [];
    const letters = new Set<string>();
    for (const sign of results) {
      const first = sign.name[0]?.toUpperCase();
      if (first && /[A-Z]/.test(first)) letters.add(first);
    }
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => ({
      letter: l,
      available: letters.has(l),
    }));
  }, [results, query, semanticField, difficulty, hasVideo]);

  function jumpToLetter(letter: string) {
    const index = results.findIndex(
      (s) => s.name[0]?.toUpperCase() === letter
    );
    if (index >= 0) {
      setPage(Math.floor(index / PAGE_SIZE));
    }
  }

  return (
    <div className="space-y-6">
      <ContinuePracticing catalog={catalog} />
      <FavoritesList catalog={catalog} />

      <SignSearch
        query={query}
        onQueryChange={(q) => { setQuery(q); setPage(0); }}
        semanticField={semanticField}
        onSemanticFieldChange={(f) => { setSemanticField(f); setPage(0); }}
        difficulty={difficulty}
        onDifficultyChange={(d) => { setDifficulty(d); setPage(0); }}
        hasVideo={hasVideo}
        onHasVideoChange={(v) => { setHasVideo(v); setPage(0); }}
        semanticFields={semanticFields}
        resultCount={results.length}
      />

      {/* Alphabetical jump nav */}
      {jumpLetters.length > 0 && (
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-1 justify-center">
          {jumpLetters.map(({ letter, available }) => (
            <button
              key={letter}
              onClick={() => available && jumpToLetter(letter)}
              disabled={!available}
              aria-label={t("jumpToLetter", { letter })}
              className={`w-8 h-8 text-xs font-medium rounded transition-colors ${
                available
                  ? "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-brand-500 hover:text-brand-600 text-gray-700 dark:text-gray-300"
                  : "text-gray-300 dark:text-gray-700 cursor-default"
              }`}
            >
              {letter}
            </button>
          ))}
        </nav>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pageResults.map((sign, i) => {
          const prev = i > 0 ? pageResults[i - 1] : (currentPage > 0 ? results[currentPage * PAGE_SIZE - 1] : null);
          const isLetter = /^[A-Z]$/.test(sign.name);
          const isNumber = /^\d+$/.test(sign.name);
          const prevIsLetter = prev ? /^[A-Z]$/.test(prev.name) : false;
          const prevIsNumber = prev ? /^\d+$/.test(prev.name) : false;

          const showAlphabetHeader = isLetter && !prevIsLetter && !query;
          const showNumberHeader = isNumber && !prevIsNumber && !query;
          const showWordHeader = !isLetter && !isNumber && (prevIsLetter || prevIsNumber || !prev) && !query;

          return (
            <>
              {showAlphabetHeader && (
                <h3 key="header-alphabet" className="col-span-full text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 pt-2">
                  {t("alphabets")}
                </h3>
              )}
              {showNumberHeader && (
                <h3 key="header-numbers" className="col-span-full text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 pt-2">
                  {t("numbers")}
                </h3>
              )}
              {showWordHeader && (
                <h3 key="header-words" className="col-span-full text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 pt-2">
                  {t("words")}
                </h3>
              )}
              <SignCard key={sign.slug} sign={sign} />
            </>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" role="navigation" className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            aria-label={t("previousPage")}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t("previousPage")}
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            {t("pageOf", { current: currentPage + 1, total: totalPages })}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            aria-label={t("nextPage")}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t("nextPage")}
          </button>
        </nav>
      )}
    </div>
  );
}
