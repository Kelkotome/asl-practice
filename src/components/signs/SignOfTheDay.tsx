import Link from "next/link";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { getSignOfTheDay } from "@/lib/signs/sign-of-the-day";
import DifficultyBadge from "./DifficultyBadge";

interface SignOfTheDayProps {
  catalog: SignCatalogEntry[];
}

export default function SignOfTheDay({ catalog }: SignOfTheDayProps) {
  const sign = getSignOfTheDay(catalog);
  if (!sign) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Sign of the Day
      </h2>
      <Link
        href={`/signs/${sign.slug}`}
        className="block max-w-md mx-auto p-6 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-950/30 dark:to-blue-950/30 rounded-xl border border-brand-200 dark:border-brand-800 hover:shadow-lg transition-shadow"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {sign.name}
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <DifficultyBadge difficulty={sign.difficulty} />
            {sign.semanticField && <span>{sign.semanticField}</span>}
            {sign.lexicalClass && <span>{sign.lexicalClass}</span>}
          </div>
          <span className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            Practice Now &rarr;
          </span>
        </div>
      </Link>
    </div>
  );
}
