"use client";

import Link from "next/link";
import type { SignCatalogEntry } from "@/lib/signs/types";
import DifficultyBadge from "@/components/signs/DifficultyBadge";
import { usePracticeProgress } from "@/lib/progress/hooks";

export default function PathSignList({ signs, pathSlug }: { signs: SignCatalogEntry[]; pathSlug: string }) {
  const progress = usePracticeProgress();

  return (
    <ol className="divide-y divide-gray-200 dark:divide-gray-800">
      {signs.map((sign, index) => {
        const practiced = (progress[sign.slug]?.count ?? 0) > 0;
        return (
          <li key={sign.slug}>
            <Link
              href={`/signs/${sign.slug}?path=${pathSlug}`}
              className="flex items-center gap-4 py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 w-6 text-right">
                {index + 1}
              </span>
              <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                {sign.name}
              </span>
              <div className="flex items-center gap-2">
                {sign.videoId && (
                  <span className="text-xs text-brand-600 dark:text-brand-400">
                    Video
                  </span>
                )}
                {sign.hasLexData && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    ASL-LEX
                  </span>
                )}
                <DifficultyBadge difficulty={sign.difficulty} />
                {practiced ? (
                  <span className="text-green-600 dark:text-green-400" aria-label="Practiced">
                    ✓
                  </span>
                ) : (
                  <span className="text-gray-300 dark:text-gray-600" aria-label="Not yet practiced">
                    ○
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
