"use client";

import { usePathProgress } from "@/lib/paths/hooks";

export default function ProgressBar({ signSlugs }: { signSlugs: string[] }) {
  const { total, practiced, percentage } = usePathProgress(signSlugs);

  return (
    <div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-600 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {practiced} of {total} practiced
      </p>
    </div>
  );
}
