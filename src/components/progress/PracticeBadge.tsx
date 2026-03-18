"use client";

interface PracticeBadgeProps {
  count: number;
}

export default function PracticeBadge({ count }: PracticeBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
      Practiced {count}x
    </span>
  );
}
