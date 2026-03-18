"use client";

import { useFavorites } from "@/lib/favorites/hooks";

interface FavoriteButtonProps {
  slug: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({ slug, size = "md" }: FavoriteButtonProps) {
  const { toggle, isFavorite } = useFavorites();
  const favorited = isFavorite(slug);

  const sizeClasses = size === "sm"
    ? "w-7 h-7 text-sm"
    : "w-9 h-9 text-lg";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-colors shrink-0 ${
        favorited
          ? "text-red-500 hover:text-red-600"
          : "text-gray-300 dark:text-gray-600 hover:text-red-400"
      }`}
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
