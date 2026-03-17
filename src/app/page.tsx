import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASL Practice — Learn Sign Language with AI Coaching",
  description:
    "Practice ASL signs with real-time camera feedback. Get AI coaching grounded in ASL-LEX linguistic data. 2,500+ signs available.",
};

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Practice ASL with{" "}
          <span className="text-brand-600">AI Coaching</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Pick a sign, watch the reference video, try it on camera, and get
          instant feedback on your handshape, movement, and location — powered
          by ASL-LEX linguistic data.
        </p>
        <Link
          href="/signs"
          className="inline-flex items-center px-8 py-4 bg-brand-600 text-white rounded-lg text-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          Browse 2,500+ Signs →
        </Link>
      </div>

      <div className="mt-20 grid sm:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-3xl mb-3">1.</div>
          <h3 className="font-semibold text-lg mb-2">Watch</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a sign and watch the reference video to see the correct form.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">2.</div>
          <h3 className="font-semibold text-lg mb-2">Practice</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Turn on your camera and sign it. MediaPipe tracks your hand
            landmarks in real time.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">3.</div>
          <h3 className="font-semibold text-lg mb-2">Improve</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get AI coaching that compares your attempt against ASL-LEX
            phonological ground truth.
          </p>
        </div>
      </div>

      <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h2 className="font-semibold text-lg mb-2">How it works</h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>MediaPipe</strong> detects 21 hand landmarks per hand in
            your browser — nothing is uploaded to a server.
          </li>
          <li>
            <strong>ASL-LEX 2.0</strong> provides the linguistic ground truth:
            handshape, movement, location, and more for each sign.
          </li>
          <li>
            <strong>AI coaching</strong> compares your detected features against
            the reference data and gives specific, actionable tips.
          </li>
        </ul>
      </div>
    </div>
  );
}
