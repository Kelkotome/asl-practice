"use client";

import { useTranslations } from "next-intl";

const STYLES: Record<number, string> = {
  1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  3: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const KEYS: Record<number, string> = {
  1: "difficultyEasy",
  2: "difficultyMedium",
  3: "difficultyHard",
};

export default function DifficultyBadge({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  const t = useTranslations("signs");
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STYLES[difficulty]}`}>
      {t(KEYS[difficulty])}
    </span>
  );
}
