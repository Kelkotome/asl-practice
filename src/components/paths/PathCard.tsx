"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { LearningPath } from "@/lib/paths/types";
import DifficultyBadge from "@/components/signs/DifficultyBadge";
import ProgressBar from "./ProgressBar";

export default function PathCard({ path }: { path: LearningPath }) {
  const t = useTranslations("pathsPage");

  return (
    <Link
      href={`/paths/${path.slug}`}
      className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-brand-500 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden="true">
            {path.icon}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {t(`pathNames.${path.slug}`)}
          </h3>
        </div>
        <DifficultyBadge difficulty={path.difficulty} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {t(`pathDescriptions.${path.slug}`)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {t("signCount", { count: path.signSlugs.length })}
      </p>
      <ProgressBar signSlugs={path.signSlugs} />
    </Link>
  );
}
