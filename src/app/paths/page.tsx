import type { Metadata } from "next";
import { LEARNING_PATHS } from "@/lib/paths/data";
import PathCard from "@/components/paths/PathCard";

export const metadata: Metadata = {
  title: "Learning Paths — ASL Practice",
  description:
    "Guided learning paths for ASL practice. Start with beginner signs, fingerspelling, numbers, and themed bundles.",
  openGraph: {
    url: "https://practice.deafened.org/paths",
  },
};

export default function PathsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Learning Paths
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Structured paths to guide your ASL learning. Pick a path and work through the signs in order.
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
