import Link from "next/link";
import type { Metadata } from "next";
import * as fs from "fs";
import * as path from "path";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { LEARNING_PATHS } from "@/lib/paths/data";
import { getFeaturedPaths } from "@/lib/paths/utils";
import PathCard from "@/components/paths/PathCard";
import StreakBadge from "@/components/progress/StreakBadge";
import SignOfTheDay from "@/components/signs/SignOfTheDay";

export const metadata: Metadata = {
  title: "ASL Practice — Learn Sign Language with AI Coaching",
  description:
    "Practice ASL signs with real-time camera feedback. Get AI coaching grounded in ASL-LEX linguistic data. 2,500+ signs available.",
  openGraph: {
    url: "https://practice.deafened.org",
  },
};

function getCatalog(): SignCatalogEntry[] {
  const filePath = path.join(process.cwd(), "data", "signs.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SignCatalogEntry[];
}

function getFeaturedSigns(catalog: SignCatalogEntry[]): SignCatalogEntry[] {
  return catalog
    .filter(
      (s) => s.difficulty === 1 && s.videoId && s.hasLexData && s.frequency,
    )
    .sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0))
    .slice(0, 8);
}

export default function LandingPage() {
  const catalog = getCatalog();
  const featured = getFeaturedSigns(catalog);
  const signCount = catalog.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-24">
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
          Practice ASL with{" "}
          <span className="text-brand-600">AI Coaching</span>
        </h1>
        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Pick a sign, watch the reference video, try it on camera, and get
          instant feedback on your handshape, movement, and location — powered
          by ASL-LEX linguistic data.
        </p>
        <Link
          href="/signs"
          className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-brand-600 text-white rounded-lg text-base sm:text-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          Browse {signCount.toLocaleString()}+ Signs →
        </Link>
        <div className="mt-4">
          <StreakBadge />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-10 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6">
        <div className="text-center p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl sm:text-3xl font-bold text-brand-600">
            {signCount.toLocaleString()}+
          </div>
          <div className="mt-1 text-xs sm:text-base text-gray-600 dark:text-gray-400">Signs</div>
        </div>
        <div className="text-center p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl sm:text-3xl font-bold text-brand-600">ASL-LEX</div>
          <div className="mt-1 text-xs sm:text-base text-gray-600 dark:text-gray-400">Powered</div>
        </div>
        <div className="text-center p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl sm:text-3xl font-bold text-brand-600">100%</div>
          <div className="mt-1 text-xs sm:text-base text-gray-600 dark:text-gray-400">Private</div>
        </div>
      </div>

      {/* 3-Step Explanation */}
      <div className="mt-12 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">1.</div>
          <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">Watch</h3>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Select a sign and watch the reference video.
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">2.</div>
          <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">Practice</h3>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Turn on your camera and sign it.
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">3.</div>
          <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">Improve</h3>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Get AI coaching on your form.
          </p>
        </div>
      </div>

      {/* Sign of the Day */}
      <SignOfTheDay catalog={catalog} />

      {/* Featured Signs */}
      {featured.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Popular Beginner Signs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featured.map((sign) => (
              <Link
                key={sign.slug}
                href={`/signs/${sign.slug}`}
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:shadow-md transition-all text-center"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {sign.name}
                </span>
                {sign.semanticField && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {sign.semanticField}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <p className="text-center mt-4">
            <Link
              href="/signs"
              className="text-brand-600 hover:underline font-medium"
            >
              Browse all signs →
            </Link>
          </p>
        </div>
      )}

      {/* Learning Paths */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Learning Paths
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {getFeaturedPaths(LEARNING_PATHS).map((p) => (
            <PathCard key={p.slug} path={p} />
          ))}
        </div>
        <p className="text-center mt-4">
          <Link
            href="/paths"
            className="text-brand-600 hover:underline font-medium"
          >
            View all learning paths →
          </Link>
        </p>
      </div>

      {/* How it works */}
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

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Do I need a webcam?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes — a webcam or phone camera is required for the practice
              feature. You can still browse signs and watch reference videos
              without one.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Is my camera data private?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Absolutely. Hand tracking runs entirely in your browser using
              MediaPipe. No video or images are ever sent to a server.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              What is ASL-LEX?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              ASL-LEX 2.0 is a publicly available database of linguistic
              properties for thousands of ASL signs, created by researchers at
              Boston University and Haskins Laboratories. We use it to ground
              coaching feedback in real phonological data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Is this free?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, the practice tool is completely free to use.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Cross-Link */}
      <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
        <h2 className="font-semibold text-lg mb-2">
          Looking for sign descriptions and videos?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our ASL Dictionary has detailed articles for every sign, with videos,
          usage examples, and linguistic data.
        </p>
        <a
          href="https://deafened.org/asl-dictionary/"
          className="inline-flex items-center px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          Browse the ASL Dictionary →
        </a>
      </div>
    </div>
  );
}
