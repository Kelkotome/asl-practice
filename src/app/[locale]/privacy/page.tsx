import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, defaultLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `https://practice.deafened.org${l === defaultLocale ? "" : `/${l}`}/privacy`,
        ])
      ),
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {t("lastUpdated")}
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("yourPrivacyMatters")}
          </h2>
          <p>{t("yourPrivacyMattersText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("cameraVideoData")}
          </h2>
          <p>
            {t.rich("cameraVideoDataText", {
              bold: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("aiCoachingFeedback")}
          </h2>
          <p>{t("aiCoachingFeedbackText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("practiceProgress")}
          </h2>
          <p>{t("practiceProgressText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("noAccounts")}
          </h2>
          <p>{t("noAccountsText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("cookiesAnalytics")}
          </h2>
          <p>{t("cookiesAnalyticsText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("thirdPartyServices")}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>YouTube</strong> — {t("youtubeNote")}
            </li>
            <li>
              <strong>MediaPipe</strong> — {t("mediaPipeNote")}
            </li>
            <li>
              <strong>PostHog</strong> — {t("postHogNote")}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("dataSummary")}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left font-medium">{t("tableData")}</th>
                  <th className="px-4 py-2 text-left font-medium">{t("tableCollected")}</th>
                  <th className="px-4 py-2 text-left font-medium">{t("tableStored")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{t("cameraFootage")}</td>
                  <td className="px-4 py-2">{t("no")}</td>
                  <td className="px-4 py-2">{t("no")}</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{t("handLandmarks")}</td>
                  <td className="px-4 py-2">{t("onlyForFeedback")}</td>
                  <td className="px-4 py-2">{t("no")}</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{t("practiceProgressData")}</td>
                  <td className="px-4 py-2">{t("browserOnly")}</td>
                  <td className="px-4 py-2">{t("browserLocalStorage")}</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{t("personalInfo")}</td>
                  <td className="px-4 py-2">{t("no")}</td>
                  <td className="px-4 py-2">{t("no")}</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{t("cookiesTracking")}</td>
                  <td className="px-4 py-2">{t("anonymousPageAnalytics")}</td>
                  <td className="px-4 py-2">{t("notStoredOnDevice")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            {t("contactTitle")}
          </h2>
          <p>
            {t.rich("contactText", {
              link: (chunks) => (
                <a
                  href="https://deafened.org"
                  className="text-brand-600 hover:text-brand-700 underline"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
