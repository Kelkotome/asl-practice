"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { useRecentlyPracticed } from "@/lib/progress/hooks";
import DifficultyBadge from "@/components/signs/DifficultyBadge";

interface ContinuePracticingProps {
  catalog: SignCatalogEntry[];
}

export default function ContinuePracticing({
  catalog,
}: ContinuePracticingProps) {
  const t = useTranslations("progress");
  const recent = useRecentlyPracticed(6);

  if (recent.length === 0) return null;

  const catalogMap = new Map(catalog.map((s) => [s.slug, s]));
  const recentSigns = recent
    .map((r) => catalogMap.get(r.slug))
    .filter((s): s is SignCatalogEntry => s !== undefined);

  if (recentSigns.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {t("continuePracticing")}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentSigns.map((sign) => (
          <Link
            key={sign.slug}
            href={`/signs/${sign.slug}`}
            className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand-500 hover:shadow-md transition-all min-w-[160px]"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {sign.name}
              </span>
              <DifficultyBadge difficulty={sign.difficulty} />
            </div>
            {sign.semanticField && (
              <span className="text-xs text-gray-500 mt-1 block">
                {sign.semanticField}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
