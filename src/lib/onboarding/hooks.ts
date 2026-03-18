"use client";

import { useState, useEffect, useCallback } from "react";
import { hasCompletedOnboarding, completeOnboarding } from "./store";

export function useOnboarding(): {
  showOnboarding: boolean;
  complete: () => void;
} {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!hasCompletedOnboarding());
  }, []);

  const complete = useCallback(() => {
    completeOnboarding();
    setShowOnboarding(false);
  }, []);

  return { showOnboarding, complete };
}
