"use client";

import Link from "next/link";
import type { SignCatalogEntry } from "@/lib/signs/types";
import DifficultyBadge from "./DifficultyBadge";
import PracticeBadge from "@/components/progress/PracticeBadge";
import { usePracticeProgress } from "@/lib/progress/hooks";

export default function SignCard({ sign }: { sign: SignCatalogEntry }) {
  const progress = usePracticeProgress();
  const practiceCount = progress[sign.slug]?.count ?? 0;

  return (
    <Link
      href={`/signs/${sign.slug}`}
      aria-label={`Practice sign: ${sign.name}${sign.semanticField ? `, topic: ${sign.semanticField}` : ""}`}
      className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand-500 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {sign.name}
        </h3>
        <div className="flex items-center gap-2">
          <PracticeBadge count={practiceCount} />
          <DifficultyBadge difficulty={sign.difficulty} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        {sign.signType && <span>{sign.signType}</span>}
        {sign.lexicalClass && (
          <>
            {sign.signType && <span>·</span>}
            <span>{sign.lexicalClass}</span>
          </>
        )}
        {sign.semanticField && (
          <>
            <span>·</span>
            <span>{sign.semanticField}</span>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        {sign.videoId && (
          <span className="text-xs text-brand-600 dark:text-brand-400">
            Video available
          </span>
        )}
        {sign.hasLexData && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            ASL-LEX data
          </span>
        )}
      </div>
    </Link>
  );
}
