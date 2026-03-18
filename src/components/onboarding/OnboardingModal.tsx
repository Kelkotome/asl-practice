"use client";

import { useState, useEffect, useRef } from "react";

interface OnboardingModalProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to ASL Practice",
    description:
      "Here's how it works: watch a reference video, practice the sign on camera, and get AI coaching to improve your form.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-600">
        <path d="M7 11v-1a5 5 0 0 1 10 0v1" strokeLinecap="round" />
        <path d="M5.5 11h13a1.5 1.5 0 0 1 1.5 1.5v0a7.5 7.5 0 0 1-7.5 7.5h-1A7.5 7.5 0 0 1 4 12.5v0A1.5 1.5 0 0 1 5.5 11z" />
        <path d="M12 11v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Camera & Privacy",
    description:
      "Hand tracking runs entirely in your browser using MediaPipe. No video or images are ever uploaded to a server — your practice is 100% private.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600">
        <rect x="2" y="6" width="15" height="12" rx="2" />
        <path d="M17 9.5l4-2.5v10l-4-2.5" />
        <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Get Started",
    description:
      "Click 'Start Camera' to begin practicing. Record your sign, then hit 'Get Feedback' for personalized coaching grounded in ASL-LEX linguistic data.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-600">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10,8 16,12 10,16" fill="currentColor" />
      </svg>
    ),
  },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onComplete();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [step, onComplete]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ASL Practice"
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-8"
      >
        <div className="text-center mb-6">{current.icon}</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-3">
          {current.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          {current.description}
        </p>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step
                  ? "bg-brand-600"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onComplete}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            Skip
          </button>
          {isLast ? (
            <button
              onClick={onComplete}
              className="flex-1 px-4 py-2.5 text-sm bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              Let&apos;s Go
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 px-4 py-2.5 text-sm bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
