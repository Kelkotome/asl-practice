import type { Metadata } from "next";
import * as fs from "fs";
import * as path from "path";
import type { SignCatalogEntry } from "@/lib/signs/types";
import SignGrid from "@/components/signs/SignGrid";

export const metadata: Metadata = {
  title: "Browse ASL Signs — ASL Practice",
  description:
    "Search and filter 2,500+ ASL signs by topic, difficulty, and more. Practice with AI coaching.",
  openGraph: {
    url: "https://practice.deafened.org/signs",
  },
};

async function getCatalog(): Promise<SignCatalogEntry[]> {
  const filePath = path.join(process.cwd(), "data", "signs.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SignCatalogEntry[];
}

export default async function SignsPage() {
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
