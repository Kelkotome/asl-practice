"use client";

import Link from "next/link";
import type { LearningPath } from "@/lib/paths/types";
import DifficultyBadge from "@/components/signs/DifficultyBadge";
import ProgressBar from "./ProgressBar";

export default function PathCard({ path }: { path: LearningPath }) {
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
            {path.name}
          </h3>
        </div>
        <DifficultyBadge difficulty={path.difficulty} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {path.description}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {path.signSlugs.length} signs
      </p>
      <ProgressBar signSlugs={path.signSlugs} />
    </Link>
  );
}
