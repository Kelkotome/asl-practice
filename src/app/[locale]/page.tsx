import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import * as fs from "fs";
import * as path from "path";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { LEARNING_PATHS } from "@/lib/paths/data";
import { getFeaturedPaths } from "@/lib/paths/utils";
import { locales, defaultLocale } from "@/i18n/config";
import PathCard from "@/components/paths/PathCard";
import StreakBadge from "@/components/progress/StreakBadge";
import SignOfTheDay from "@/components/signs/SignOfTheDay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    openGraph: {
      url: "https://practice.deafened.org",
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `https://practice.deafened.org${l === defaultLocale ? "" : `/${l}`}`,
        ])
      ),
    },
  };
}

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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const catalog = getCatalog();
  const featured = getFeaturedSigns(catalog);
  const signCount = catalog.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-24">
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
          {t.rich("heroTitle", {
            accent: (chunks) => (
              <span className="text-brand-600">{chunks}</span>
            ),
          })}
        </h1>
        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
          {t("heroSubtitle")}
        </p>
        <Link
          href="/signs"
          className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-brand-600 text-white rounded-lg text-base sm:text-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          {t("browseSigns", { count: signCount.toLocaleString() })}
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
          <div className="mt-1 text-xs sm:text-base text-gray-600 dark:text-gray-400">
            {t("signsLabel")}
          </div>
        </div>
        <div className="text-center p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl sm:text-3xl font-bold text-brand-600">ASL-LEX</div>
          <div className="mt-1 text-xs sm:text-base text-gray-600 dark:text-gray-400">
            {t("powered")}
          </div>
        </div>
        <div className="text-center p-3 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl sm:text-3xl font-bold text-brand-600">100%</div>
          <div className="mt-1 text-xs sm:text-base text-gray-600 dark:text-gray-400">
            {t("private")}
          </div>
        </div>
      </div>

      {/* 3-Step Explanation */}
      <div className="mt-12 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">1.</div>
          <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">
            {t("watchTitle")}
          </h3>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            {t("watchDescription")}
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">2.</div>
          <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">
            {t("practiceTitle")}
          </h3>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            {t("practiceDescription")}
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">3.</div>
          <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">
            {t("improveTitle")}
          </h3>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            {t("improveDescription")}
          </p>
        </div>
      </div>

      {/* Sign of the Day */}
      <SignOfTheDay catalog={catalog} />

      {/* Featured Signs */}
      {featured.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            {t("popularSigns")}
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
              {t("browseAllSigns")}
            </Link>
          </p>
        </div>
      )}

      {/* Learning Paths */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          {t("learningPaths")}
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
            {t("viewAllPaths")}
          </Link>
        </p>
      </div>

      {/* How it works */}
      <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h2 className="font-semibold text-lg mb-2">{t("howItWorks")}</h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>MediaPipe</strong> {t("howMediaPipe")}
          </li>
          <li>
            <strong>ASL-LEX 2.0</strong> {t("howAslLex")}
          </li>
          <li>
            <strong>AI coaching</strong> {t("howAiCoaching")}
          </li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          {t("faqTitle")}
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {t("faqWebcamQ")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("faqWebcamA")}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {t("faqPrivacyQ")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("faqPrivacyA")}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {t("faqAslLexQ")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("faqAslLexA")}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {t("faqFreeQ")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("faqFreeA")}
            </p>
          </div>
        </div>
      </div>

      {/* Blog Cross-Link */}
      <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
        <h2 className="font-semibold text-lg mb-2">
          {t("dictionaryTitle")}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {t("dictionaryDescription")}
        </p>
        <a
          href="https://deafened.org/asl-dictionary/"
          className="inline-flex items-center px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          {t("browseDictionary")}
        </a>
      </div>
    </div>
  );
}
