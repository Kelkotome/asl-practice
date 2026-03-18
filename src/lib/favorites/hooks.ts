"use client";

import { useState, useEffect, useCallback } from "react";
import { getFavorites, toggleFavorite as toggleFavoriteStore } from "./store";

export function useFavorites(): {
  favorites: Set<string>;
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
} {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const toggle = useCallback((slug: string) => {
    toggleFavoriteStore(slug);
    setFavorites(getFavorites());
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.has(slug),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
