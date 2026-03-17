import * as fs from "fs";
import * as path from "path";
import type { Metadata } from "next";
import type { SignDetail, SignCatalogEntry } from "@/lib/signs/types";
import PracticeClient from "./PracticeClient";

interface PageProps {
  params: { slug: string };
}

function loadSignDetail(slug: string): SignDetail | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "sign-details",
      `${slug}.json`
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as SignDetail;
  } catch {
    return null;
  }
}

function loadCatalog(): SignCatalogEntry[] {
  const filePath = path.join(process.cwd(), "data", "signs.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SignCatalogEntry[];
}

export async function generateStaticParams() {
  const catalog = loadCatalog();
  return catalog.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const sign = loadSignDetail(params.slug);
  if (!sign) return { title: "Sign Not Found" };

  return {
    title: `Practice "${sign.name}" in ASL — ASL Practice`,
    description: `Practice the ASL sign for "${sign.name}" with real-time camera feedback and AI coaching. ${sign.signType || ""} sign${sign.majorLocation ? `, location: ${sign.majorLocation}` : ""}.`,
  };
}

export default async function PracticePage({ params }: PageProps) {
  const sign = loadSignDetail(params.slug);

  if (!sign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The sign &quot;{params.slug}&quot; was not found.
        </p>
      </div>
    );
  }

  return <PracticeClient sign={sign} />;
}
