"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface CaptureButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  maxDuration?: number;
}

export default function CaptureButton({
  isRecording,
  onStart,
  onStop,
  maxDuration = 5,
}: CaptureButtonProps) {
  const t = useTranslations("camera");
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.1;
          if (next >= maxDuration) {
            onStop();
            return maxDuration;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, maxDuration, onStop]);

  return (
    <div className="flex items-center justify-center gap-4">
      {isRecording ? (
        <>
          <div
            className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2"
            role="progressbar"
            aria-valuenow={Math.round((elapsed / maxDuration) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Recording progress"
          >
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${(elapsed / maxDuration) * 100}%` }}
            />
          </div>
          <button
            onClick={onStop}
            aria-label={t("stop", { seconds: Math.ceil(maxDuration - elapsed) })}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-colors text-sm sm:text-base min-h-[44px]"
          >
            {t("stop", { seconds: Math.ceil(maxDuration - elapsed) })}
          </button>
        </>
      ) : (
        <button
          onClick={onStart}
          aria-label={t("recordSign", { seconds: maxDuration })}
          className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 active:bg-brand-800 transition-colors text-sm sm:text-base min-h-[44px]"
        >
          {t("recordSign", { seconds: maxDuration })}
        </button>
      )}
    </div>
  );
}
