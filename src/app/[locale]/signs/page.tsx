import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import * as fs from "fs";
import * as path from "path";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { locales, defaultLocale } from "@/i18n/config";
import SignGrid from "@/components/signs/SignGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("browseTitle"),
    description: t("browseDescription"),
    openGraph: {
      url: "https://practice.deafened.org/signs",
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `https://practice.deafened.org${l === defaultLocale ? "" : `/${l}`}/signs`,
        ])
      ),
    },
  };
}

async function getCatalog(): Promise<SignCatalogEntry[]> {
  const filePath = path.join(process.cwd(), "data", "signs.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SignCatalogEntry[];
}

export default async function SignsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  const catalog = await getCatalog();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Browse Signs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search {catalog.length.toLocaleString()} ASL signs. Pick one to practice with camera feedback.
        </p>
      </div>

      <SignGrid catalog={catalog} />
    </div>
  );
}
