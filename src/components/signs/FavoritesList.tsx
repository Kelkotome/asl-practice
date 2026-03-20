"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { useFavorites } from "@/lib/favorites/hooks";
import FavoriteButton from "./FavoriteButton";

interface FavoritesListProps {
  catalog: SignCatalogEntry[];
}

export default function FavoritesList({ catalog }: FavoritesListProps) {
  const t = useTranslations("signs");
  const { favorites } = useFavorites();

  if (favorites.size === 0) return null;

  const favoriteSigns = catalog.filter((s) => favorites.has(s.slug));
  if (favoriteSigns.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {t("savedSigns", { count: favoriteSigns.length })}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {favoriteSigns.map((sign) => (
          <div
            key={sign.slug}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FavoriteButton slug={sign.slug} size="sm" />
            <div className="min-w-0 flex-1">
              <Link
                href={`/signs/${sign.slug}`}
                className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-brand-600 truncate block"
              >
                {sign.name}
              </Link>
              <div className="flex gap-2 text-xs">
                <Link
                  href={`/signs/${sign.slug}`}
                  className="text-brand-600 hover:underline"
                >
                  {t("practiceBtn")}
                </Link>
                {sign.blogUrl && (
                  <a
                    href={sign.blogUrl}
                    className="text-gray-400 hover:text-brand-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("tutorialBtn")}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
