"use client";

import { useCallback, useState } from "react";
import type { SignDetail, SignCatalogEntry, LandmarkFrame } from "@/lib/signs/types";
import CameraFeed from "@/components/camera/CameraFeed";
import ReferencePlayer from "@/components/video/ReferencePlayer";
import DifficultyBadge from "@/components/signs/DifficultyBadge";
import RelatedSigns from "@/components/signs/RelatedSigns";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useRecordPractice } from "@/lib/progress/hooks";
import { useOnboarding } from "@/lib/onboarding/hooks";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import StreakBadge from "@/components/progress/StreakBadge";

interface PracticeClientProps {
  sign: SignDetail;
  relatedSigns?: SignCatalogEntry[];
}

export default function PracticeClient({ sign, relatedSigns = [] }: PracticeClientProps) {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedData, setRecordedData] = useState<{
    frames: LandmarkFrame[];
    duration: number;
  } | null>(null);
  const { record: recordProgress } = useRecordPractice(sign.slug);
  const { showOnboarding, complete: completeOnboarding } = useOnboarding();

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setFeedback(accumulated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setIsLoading(false);
    }
  }, [sign.slug, recordedData]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/signs"
            className="text-sm text-gray-500 hover:text-brand-600"
          >
            &larr; All Signs
          </Link>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {sign.name}
              </h1>
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
              Tutorial &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Step guide */}
      <div className="mb-4 sm:mb-6 flex items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm">
        <div className={`flex items-center gap-1.5 sm:gap-2 ${!recordedData && !feedback ? "text-brand-600 font-semibold" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${!recordedData && !feedback ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>1</span>
          <span className="hidden sm:inline">Watch the video</span>
          <span className="sm:hidden">Watch</span>
        </div>
        <div className="h-px w-4 sm:w-6 bg-gray-300 dark:bg-gray-700" />
        <div className={`flex items-center gap-1.5 sm:gap-2 ${recordedData && !feedback ? "text-brand-600 font-semibold" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${recordedData && !feedback ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>2</span>
          <span className="hidden sm:inline">Record your sign</span>
          <span className="sm:hidden">Record</span>
        </div>
        <div className="h-px w-4 sm:w-6 bg-gray-300 dark:bg-gray-700" />
        <div className={`flex items-center gap-1.5 sm:gap-2 ${feedback ? "text-brand-600 font-semibold" : "text-gray-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${feedback ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>3</span>
          <span className="hidden sm:inline">Get feedback</span>
          <span className="sm:hidden">Feedback</span>
        </div>
      </div>

      {/* Main layout: video + camera side-by-side on tablet, 3-col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Reference video */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-semibold text-base sm:text-lg">Reference Video</h2>
          {sign.videoId ? (
            <ReferencePlayer videoId={sign.videoId} signName={sign.name} />
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center text-gray-500">
              No video available
            </div>
          )}

          {/* Sign details — collapsible on mobile */}
          {sign.hasLexData && (
            <details className="bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              <summary className="p-3 sm:p-4 font-medium cursor-pointer select-none list-none flex items-center justify-between [&::-webkit-details-marker]:hidden">
                ASL-LEX Data
                <span className="text-gray-400 text-xs ml-2">tap to expand</span>
              </summary>
              <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-1">
                {sign.handshape && <p><strong>Handshape:</strong> {sign.handshape}</p>}
                {sign.movement && <p><strong>Movement:</strong> {sign.movement}</p>}
                {sign.majorLocation && <p><strong>Location:</strong> {sign.majorLocation}</p>}
                {sign.contact && <p><strong>Contact:</strong> {sign.contact}</p>}
                {sign.iconicityLabel && (
                  <p><strong>Iconicity:</strong> {sign.iconicityLabel} ({sign.iconicity}/7)</p>
                )}
                {sign.frequencyLabel && (
                  <p><strong>Frequency:</strong> {sign.frequencyLabel} ({sign.frequency}/7)</p>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Center: Camera */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-semibold text-base sm:text-lg">Your Camera</h2>
          <CameraFeed onRecordingComplete={handleRecordingComplete} />
        </div>

        {/* Right: Feedback — full width on mobile/tablet, third column on desktop */}
        <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
          <h2 className="font-semibold text-base sm:text-lg">AI Coaching</h2>
          <div
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {!recordedData && !feedback && (
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                Record yourself signing &quot;{sign.name}&quot; to get
                personalized feedback.
              </p>
            )}

            {recordedData && !feedback && !isLoading && (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Captured {recordedData.frames.length} frames over{" "}
                  {recordedData.duration.toFixed(1)}s.
                </p>
                <button
                  onClick={requestFeedback}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors w-full"
                >
                  Get Feedback
                </button>
              </div>
            )}

            {isLoading && !feedback && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="animate-spin text-lg">&#9696;</span>
                Analyzing your sign...
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {feedback && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            )}

            {feedback && !isLoading && (
              <button
                onClick={() => {
                  setRecordedData(null);
                  setFeedback("");
                }}
                className="mt-4 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>

      <RelatedSigns signs={relatedSigns} />
    </div>
  );
}
