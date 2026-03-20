"use client";

import { useTranslations } from "next-intl";

interface SignSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  semanticField: string;
  onSemanticFieldChange: (f: string) => void;
  difficulty: number;
  onDifficultyChange: (d: number) => void;
  hasVideo: boolean;
  onHasVideoChange: (v: boolean) => void;
  semanticFields: string[];
  resultCount: number;
}

export default function SignSearch({
  query,
  onQueryChange,
  semanticField,
  onSemanticFieldChange,
  difficulty,
  onDifficultyChange,
  hasVideo,
  onHasVideoChange,
  semanticFields,
  resultCount,
}: SignSearchProps) {
  const t = useTranslations("search");

  return (
    <div className="space-y-4" role="search" aria-label="Search and filter ASL signs">
      <div>
        <label htmlFor="sign-search" className="sr-only">{t("searchPlaceholder")}</label>
        <input
          id="sign-search"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label htmlFor="semantic-field-filter" className="sr-only">{t("allTopics")}</label>
        <select
          id="semantic-field-filter"
          value={semanticField}
          onChange={(e) => onSemanticFieldChange(e.target.value)}
          className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        >
          <option value="">{t("allTopics")}</option>
          {semanticFields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <label htmlFor="difficulty-filter" className="sr-only">{t("allLevels")}</label>
        <select
          id="difficulty-filter"
          value={difficulty}
          onChange={(e) => onDifficultyChange(Number(e.target.value))}
          className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        >
          <option value={0}>{t("allLevels")}</option>
          <option value={1}>{t("easy")}</option>
          <option value={2}>{t("medium")}</option>
          <option value={3}>{t("hard")}</option>
        </select>

        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={hasVideo}
            onChange={(e) => onHasVideoChange(e.target.checked)}
            className="rounded"
          />
          {t("hasVideo")}
        </label>

        <span className="text-sm text-gray-500 ml-auto" aria-live="polite">
          {t("signCount", { count: resultCount })}
        </span>
      </div>
    </div>
  );
}
