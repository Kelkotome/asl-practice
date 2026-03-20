"use client";

import { useCallback, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { SignDetail, SignCatalogEntry, LandmarkFrame } from "@/lib/signs/types";
import CameraFeed from "@/components/camera/CameraFeed";
import ReferencePlayer from "@/components/video/ReferencePlayer";
import DifficultyBadge from "@/components/signs/DifficultyBadge";
import RelatedSigns from "@/components/signs/RelatedSigns";
import ReactMarkdown from "react-markdown";
import { Link } from "@/i18n/routing";
import { useRecordPractice } from "@/lib/progress/hooks";
import { useOnboarding } from "@/lib/onboarding/hooks";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import StreakBadge from "@/components/progress/StreakBadge";
import FavoriteButton from "@/components/signs/FavoriteButton";
import ShareButton from "@/components/signs/ShareButton";
import { LEARNING_PATHS } from "@/lib/paths/data";

interface PracticeClientProps {
  sign: SignDetail;
  relatedSigns?: SignCatalogEntry[];
}

export default function PracticeClient({ sign, relatedSigns = [] }: PracticeClientProps) {
  const t = useTranslations("practice");
  const tPaths = useTranslations("pathsPage");
  const locale = useLocale();
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedData, setRecordedData] = useState<{
    frames: LandmarkFrame[];
    duration: number;
  } | null>(null);
  const [cameraState, setCameraState] = useState<"idle" | "streaming" | "recording">("idle");
  const [shareCopied, setShareCopied] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const { record: recordProgress } = useRecordPractice(sign.slug);
  const { showOnboarding, complete: completeOnboarding } = useOnboarding();
  const searchParams = useSearchParams();

  // Learning path context from query param
  const pathNav = useMemo(() => {
    const pathSlug = searchParams.get("path");
    if (!pathSlug) return null;

    const path = LEARNING_PATHS.find((p) => p.slug === pathSlug);
    if (!path) return null;

    const index = path.signSlugs.indexOf(sign.slug);
    if (index === -1) return null;

    return {
      path,
      index,
      total: path.signSlugs.length,
      prev: index > 0 ? path.signSlugs[index - 1] : null,
      next: index < path.signSlugs.length - 1 ? path.signSlugs[index + 1] : null,
    };
  }, [searchParams, sign.slug]);

  const handleRecordingComplete = useCallback(
    (frames: LandmarkFrame[], duration: number) => {
      setRecordedData({ frames, duration });
      setFeedback("");
      setError(null);
      recordProgress();
    },
    [recordProgress]
  );

  const requestFeedback = useCallback(async () => {
    if (!recordedData) return;

    setIsLoading(true);
    setFeedback("");
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signSlug: sign.slug,
          landmarks: recordedData.frames,
          duration: recordedData.duration,
          locale,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";
      let ratingParsed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Parse RATING:X from anywhere in the first few lines
        if (!ratingParsed) {
          const match = accumulated.match(/RATING\s*[:=]\s*(\d)/i);
          if (match) {
            const r = parseInt(match[1], 10);
            // Boost AI ratings: 1-2→3, 3→4, 4-5→5
            // AI underrates due to unreliable MediaPipe data
            if (r >= 1 && r <= 5) setRating(Math.min(5, r + 2));
            ratingParsed = true;
          }
        }

        // Strip any RATING line from displayed feedback
        const display = accumulated
          .replace(/^.*RATING\s*[:=]\s*\d.*\n?/im, "")
          .replace(/^\s*\n/, "");
        setFeedback(display);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setIsLoading(false);
    }
  }, [sign.slug, recordedData, locale]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-1.5 mb-1 text-sm text-gray-500">
          {pathNav ? (
            <>
              <Link href="/paths" className="hover:text-brand-600">{tPaths("title")}</Link>
              <span>/</span>
              <Link href={`/paths/${pathNav.path.slug}`} className="hover:text-brand-600">
                {tPaths(`pathNames.${pathNav.path.slug}`)}
              </Link>
              <span className="text-gray-400 ml-1">
                ({pathNav.index + 1}/{pathNav.total})
              </span>
            </>
          ) : (
            <Link href="/signs" className="hover:text-brand-600">
              {t("allSigns")}
            </Link>
          )}
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {sign.name}
              </h1>
              <FavoriteButton slug={sign.slug} />
              <ShareButton
                signName={sign.name}
                practiceUrl={`https://practice.deafened.org/signs/${sign.slug}`}
                blogUrl={sign.blogUrl}
              />
              <StreakBadge />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
              <DifficultyBadge difficulty={sign.difficulty} />
              {sign.signType && (
                <span className="text-xs sm:text-sm text-gray-500">{sign.signType}</span>
              )}
              {sign.lexicalClass && (
                <span className="text-xs sm:text-sm text-gray-500">{sign.lexicalClass}</span>
              )}
              {sign.semanticField && (
                <span className="text-xs sm:text-sm text-gray-500">{sign.semanticField}</span>
              )}
            </div>
          </div>
          {sign.blogUrl && (
            <a
              href={sign.blogUrl}
              className="text-xs sm:text-sm text-brand-600 hover:underline shrink-0 ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("tutorial")}
            </a>
          )}
        </div>
      </div>

      {/* Step guide */}
      <div className="mb-4 sm:mb-6 flex items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm">
        <div className={`flex items-center gap-1.5 sm:gap-2 ${!recordedData && !feedback ? "text-brand-600 font-semibold" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${!recordedData && !feedback ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>1</span>
          <span className="hidden sm:inline">{t("watchStep")}</span>
          <span className="sm:hidden">{t("watchStepShort")}</span>
        </div>
        <div className="h-px w-4 sm:w-6 bg-gray-300 dark:bg-gray-700" />
        <div className={`flex items-center gap-1.5 sm:gap-2 ${recordedData && !feedback ? "text-brand-600 font-semibold" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${recordedData && !feedback ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>2</span>
          <span className="hidden sm:inline">{t("recordStep")}</span>
          <span className="sm:hidden">{t("recordStepShort")}</span>
        </div>
        <div className="h-px w-4 sm:w-6 bg-gray-300 dark:bg-gray-700" />
        <div className={`flex items-center gap-1.5 sm:gap-2 ${feedback ? "text-brand-600 font-semibold" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${feedback ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>3</span>
          <span className="hidden sm:inline">{t("feedbackStep")}</span>
          <span className="sm:hidden">{t("feedbackStepShort")}</span>
        </div>
      </div>

      {/* Main layout: video + camera side-by-side on tablet, 3-col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Reference video */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-semibold text-base sm:text-lg">{t("referenceVideo")}</h2>
          {sign.videoId ? (
            <ReferencePlayer videoId={sign.videoId} signName={sign.name} />
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center text-gray-500">
              {t("noVideo")}
            </div>
          )}

          {/* Sign details — collapsible on mobile */}
          {sign.hasLexData && (
            <details className="bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              <summary className="p-3 sm:p-4 font-medium cursor-pointer select-none list-none flex items-center justify-between [&::-webkit-details-marker]:hidden">
                {t("aslLexData")}
                <span className="text-gray-400 text-xs ml-2">{t("tapToExpand")}</span>
              </summary>
              <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-1">
                {sign.handshape && <p><strong>{t("handshape")}:</strong> {sign.handshape}</p>}
                {sign.movement && <p><strong>{t("movement")}:</strong> {sign.movement}</p>}
                {sign.majorLocation && <p><strong>{t("location")}:</strong> {sign.majorLocation}</p>}
                {sign.contact && <p><strong>{t("contact")}:</strong> {sign.contact}</p>}
                {sign.iconicityLabel && (
                  <p><strong>{t("iconicity")}:</strong> {sign.iconicityLabel} ({sign.iconicity}/7)</p>
                )}
                {sign.frequencyLabel && (
                  <p><strong>{t("frequency")}:</strong> {sign.frequencyLabel} ({sign.frequency}/7)</p>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Center: Camera */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-semibold text-base sm:text-lg">{t("yourCamera")}</h2>
          <CameraFeed onRecordingComplete={handleRecordingComplete} onStateChange={setCameraState} />
        </div>

        {/* Right: Feedback — full width on mobile/tablet, third column on desktop */}
        <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
          <h2 className="font-semibold text-base sm:text-lg">{t("aiCoaching")}</h2>
          <div
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {!recordedData && !feedback && cameraState === "idle" && (
              <div className="text-center space-y-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  {t("watchVideoPrompt")}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t("stepOf", { current: 1, total: 3 })}
                </p>
              </div>
            )}

            {!recordedData && !feedback && cameraState === "streaming" && (
              <div className="text-center space-y-2">
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  {t("cameraReady")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.rich("cameraReadyHint", {
                    bold: (chunks) => <span className="font-medium text-brand-600">{chunks}</span>,
                    signName: sign.name,
                  })}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t("stepOf", { current: 2, total: 3 })}
                </p>
              </div>
            )}

            {!recordedData && !feedback && cameraState === "recording" && (
              <div className="text-center space-y-2">
                <p className="text-brand-600 dark:text-brand-400 text-sm sm:text-base font-medium animate-pulse">
                  {t("recording", { signName: sign.name })}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t("stepOf", { current: 2, total: 3 })}
                </p>
              </div>
            )}

            {recordedData && !feedback && !isLoading && (
              <div className="space-y-3 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  {t("captured", { frames: recordedData.frames.length, duration: recordedData.duration.toFixed(1) })}
                </p>
                <button
                  onClick={requestFeedback}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 active:bg-brand-800 transition-colors w-full min-h-[44px]"
                >
                  {t("getFeedback")}
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t("stepOf", { current: 3, total: 3 })}
                </p>
              </div>
            )}

            {isLoading && !feedback && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="animate-spin text-lg">&#9696;</span>
                {t("analyzing")}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {feedback && (
              <div className="space-y-3">
                {rating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 ${star <= rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"}`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {rating <= 2 ? t("ratingKeepPracticing") : rating <= 3 ? t("ratingGoodEffort") : rating <= 4 ? t("ratingGreatJob") : t("ratingPerfect")}
                    </span>
                  </div>
                )}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{feedback}</ReactMarkdown>
                </div>
              </div>
            )}

            {feedback && !isLoading && (
              <div className="mt-4 space-y-4">
                <button
                  onClick={() => {
                    setRecordedData(null);
                    setFeedback("");
                    setRating(0);
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {t("tryAgain")}
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t("shareWithFriends")}</p>
                  {(() => {
                    const practiceUrl = `https://practice.deafened.org/signs/${sign.slug}`;
                    const blogUrl = sign.blogUrl || `https://deafened.org/asl-sign-${sign.slug}/`;
                    const shareText = `I just practiced the ASL sign for "${sign.name}" — try it out!`;
                    const encodedText = encodeURIComponent(shareText);
                    const encodedPracticeUrl = encodeURIComponent(practiceUrl);
                    const encodedBlogUrl = encodeURIComponent(blogUrl);
                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedPracticeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            X
                          </a>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedPracticeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                          </a>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedPracticeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#25D366] text-white hover:bg-[#22C55E] transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                          </a>
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedPracticeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            LinkedIn
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try { await navigator.clipboard.writeText(practiceUrl); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); } catch {}
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            {shareCopied ? t("copied") : t("copyLink")}
                          </button>
                          <a
                            href={blogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-brand-600"
                          >
                            {t("viewTutorial")}
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Path prev/next navigation */}
      {pathNav && (
        <nav className="mt-8 flex items-center justify-between" aria-label="Learning path navigation">
          {pathNav.prev ? (
            <Link
              href={`/signs/${pathNav.prev}?path=${pathNav.path.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-400 hover:text-brand-600 transition-colors min-h-[44px]"
            >
              {t("previous")}
            </Link>
          ) : (
            <div />
          )}
          <Link
            href={`/paths/${pathNav.path.slug}`}
            className="text-xs sm:text-sm text-gray-500 hover:text-brand-600"
          >
            {t("backTo", { pathName: tPaths(`pathNames.${pathNav.path.slug}`) })}
          </Link>
          {pathNav.next ? (
            <Link
              href={`/signs/${pathNav.next}?path=${pathNav.path.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors min-h-[44px]"
            >
              {t("next")}
            </Link>
          ) : (
            <Link
              href={`/paths/${pathNav.path.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors min-h-[44px]"
            >
              {t("complete")}
            </Link>
          )}
        </nav>
      )}

      <RelatedSigns signs={relatedSigns} />
    </div>
  );
}
