import * as fs from "fs";
import * as path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { LEARNING_PATHS } from "@/lib/paths/data";
import { resolvePathSigns } from "@/lib/paths/utils";
import ProgressBar from "@/components/paths/ProgressBar";
import PathSignList from "@/components/paths/PathSignList";

interface PageProps {
  params: { slug: string };
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
  const pathData = LEARNING_PATHS.find((p) => p.slug === params.slug);
  if (!pathData) return { title: "Path Not Found" };

  return {
    title: `${pathData.name} — ASL Practice`,
    description: pathData.description,
    openGraph: {
      url: `https://practice.deafened.org/paths/${pathData.slug}`,
    },
  };
}

export default async function PathDetailPage({ params }: PageProps) {
  const pathData = LEARNING_PATHS.find((p) => p.slug === params.slug);

  if (!pathData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Path Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The learning path &quot;{params.slug}&quot; was not found.
        </p>
      </div>
    );
  }

  const catalog = loadCatalog();
  const signs = resolvePathSigns(pathData, catalog);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/paths"
        className="text-sm text-brand-600 hover:underline mb-4 inline-block"
      >
        ← All Learning Paths
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" role="img" aria-hidden="true">
            {pathData.icon}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {pathData.name}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {pathData.description}
        </p>
        <ProgressBar signSlugs={pathData.signSlugs} />
      </div>

      <PathSignList signs={signs} />
    </div>
  );
}
