"use client";

const LABELS: Record<number, { text: string; className: string }> = {
  1: { text: "Easy", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  2: { text: "Medium", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  3: { text: "Hard", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export default function DifficultyBadge({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  const { text, className } = LABELS[difficulty];
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}
