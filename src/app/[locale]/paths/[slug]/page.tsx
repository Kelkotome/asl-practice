import * as fs from "fs";
import * as path from "path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { LEARNING_PATHS } from "@/lib/paths/data";
import { resolvePathSigns } from "@/lib/paths/utils";
import { locales, defaultLocale } from "@/i18n/config";
import ProgressBar from "@/components/paths/ProgressBar";
import PathSignList from "@/components/paths/PathSignList";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function loadCatalog(): SignCatalogEntry[] {
  const filePath = path.join(process.cwd(), "data", "signs.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SignCatalogEntry[];
}

export async function generateStaticParams() {
  return LEARNING_PATHS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const pathData = LEARNING_PATHS.find((p) => p.slug === slug);
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tPaths = await getTranslations({ locale, namespace: "pathsPage" });

  if (!pathData) return { title: t("pathNotFound") };

  const pathName = tPaths(`pathNames.${pathData.slug}`);
  const basePath = `/paths/${pathData.slug}`;

  return {
    title: t("pathTitle", { name: pathName }),
    description: tPaths(`pathDescriptions.${pathData.slug}`),
    openGraph: {
      url: `https://practice.deafened.org${basePath}`,
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `https://practice.deafened.org${l === defaultLocale ? "" : `/${l}`}${basePath}`,
        ])
      ),
    },
  };
}

export default async function PathDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pathsPage" });

  const pathData = LEARNING_PATHS.find((p) => p.slug === slug);

  if (!pathData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("notFound")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("notFoundDescription", { slug })}
        </p>
      </div>
    );
  }

  const catalog = loadCatalog();
  const signs = resolvePathSigns(pathData, catalog);
  const pathName = t(`pathNames.${pathData.slug}`);
  const pathDescription = t(`pathDescriptions.${pathData.slug}`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/paths"
        className="text-sm text-brand-600 hover:underline mb-4 inline-block"
      >
        {t("allPaths")}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" role="img" aria-hidden="true">
            {pathData.icon}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {pathName}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {pathDescription}
        </p>
        <ProgressBar signSlugs={pathData.signSlugs} />
      </div>

      <PathSignList signs={signs} pathSlug={pathData.slug} />
    </div>
  );
}
