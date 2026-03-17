"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import type { LandmarkFrame } from "@/lib/signs/types";

interface FeedbackPanelProps {
  signSlug: string;
}

export default function FeedbackPanel({ signSlug }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedData, setRecordedData] = useState<{
    frames: LandmarkFrame[];
    duration: number;
  } | null>(null);

  const handleRecordingComplete = useCallback(
    (frames: LandmarkFrame[], duration: number) => {
      setRecordedData({ frames, duration });
      setFeedback("");
      setError(null);
    },
    []
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
          signSlug,
          landmarks: recordedData.frames,
          duration: recordedData.duration,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      // Stream the response
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
      setError(
        err instanceof Error ? err.message : "Failed to get feedback"
      );
    } finally {
      setIsLoading(false);
    }
  }, [signSlug, recordedData]);

  return {
    handleRecordingComplete,
    feedbackUI: (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-lg mb-4">AI Coaching Feedback</h3>

        {!recordedData && !feedback && (
          <p className="text-gray-500 dark:text-gray-400">
            Record yourself signing to get feedback. Start your camera, then
            press &quot;Record Sign&quot;.
          </p>
        )}

        {recordedData && !feedback && !isLoading && (
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-400">
              Captured {recordedData.frames.length} frames over{" "}
              {recordedData.duration.toFixed(1)}s.
            </p>
            <button
              onClick={requestFeedback}
              className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
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
    ),
  };
}
