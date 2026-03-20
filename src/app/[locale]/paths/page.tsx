import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LEARNING_PATHS } from "@/lib/paths/data";
import { locales, defaultLocale } from "@/i18n/config";
import PathCard from "@/components/paths/PathCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("pathsTitle"),
    description: t("pathsDescription"),
    openGraph: {
      url: "https://practice.deafened.org/paths",
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `https://practice.deafened.org${l === defaultLocale ? "" : `/${l}`}/paths`,
        ])
      ),
    },
  };
}

export default async function PathsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pathsPage" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t("title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEARNING_PATHS.map((p) => (
          <PathCard key={p.slug} path={p} />
        ))}
      </div>
    </div>
  );
}
