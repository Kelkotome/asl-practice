"use client";

import type { SignCatalogEntry } from "@/lib/signs/types";
import SignCard from "./SignCard";

interface RelatedSignsProps {
  signs: SignCatalogEntry[];
}

export default function RelatedSigns({ signs }: RelatedSignsProps) {
  if (signs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Related Signs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {signs.map((sign) => (
          <SignCard key={sign.slug} sign={sign} />
        ))}
      </div>
    </section>
  );
}
