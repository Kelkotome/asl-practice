"use client";

import { useTranslations } from "next-intl";
import { useStreak } from "@/lib/progress/streak-hooks";

export default function StreakBadge() {
  const t = useTranslations("progress");
  const { currentStreak, practicedToday } = useStreak();

  if (currentStreak === 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
        practicedToday
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 animate-pulse"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 23c-3.866 0-7-2.686-7-6 0-1.655.672-3.156 1.757-4.243l.008-.008C8.39 11.124 10 8.5 10 6c0-.738-.13-1.446-.367-2.1A9.96 9.96 0 0 1 12 1a9.96 9.96 0 0 1 2.367 2.9A6.98 6.98 0 0 0 14 6c0 2.5 1.61 5.124 3.235 6.749l.008.008A5.958 5.958 0 0 1 19 17c0 3.314-3.134 6-7 6z" />
      </svg>
      {t("streak", { days: currentStreak })}
    </div>
  );
}
