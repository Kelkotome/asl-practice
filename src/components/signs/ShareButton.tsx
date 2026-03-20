"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
  signName: string;
  practiceUrl: string;
  blogUrl: string;
}

export default function ShareButton({ signName, practiceUrl, blogUrl }: ShareButtonProps) {
  const t = useTranslations("signs");
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  async function handleShare(url: string, label: string) {
    const text = `Learn the ASL sign for "${signName}"`;

    // Use native share if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
        setShowMenu(false);
        return;
      } catch {
        // User cancelled or not supported, fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        aria-label={t("shareSign")}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-brand-600 transition-colors text-lg"
      >
        ↗
      </button>

      {showMenu && (
        <div className="absolute right-0 top-10 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-56">
          <button
            onClick={() => handleShare(practiceUrl, "practice")}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="font-medium">{t("sharePractice")}</span>
            <span className="block text-xs text-gray-400 mt-0.5">{t("sharePracticeHint")}</span>
            {copied === "practice" && (
              <span className="text-xs text-green-600 ml-1">{t("copied")}</span>
            )}
          </button>
          <button
            onClick={() => handleShare(blogUrl, "blog")}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="font-medium">{t("shareTutorial")}</span>
            <span className="block text-xs text-gray-400 mt-0.5">{t("shareTutorialHint")}</span>
            {copied === "blog" && (
              <span className="text-xs text-green-600 ml-1">{t("copied")}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
