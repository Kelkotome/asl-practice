import type { MetadataRoute } from "next";
import * as fs from "fs";
import * as path from "path";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { LEARNING_PATHS } from "@/lib/paths/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const filePath = path.join(process.cwd(), "data", "signs.json");
  const catalog: SignCatalogEntry[] = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );

  const signEntries: MetadataRoute.Sitemap = catalog.map((sign) => ({
    url: `https://practice.deafened.org/signs/${sign.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pathEntries: MetadataRoute.Sitemap = [
    {
      url: "https://practice.deafened.org/paths",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...LEARNING_PATHS.map((p) => ({
      url: `https://practice.deafened.org/paths/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    {
      url: "https://practice.deafened.org",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://practice.deafened.org/signs",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...pathEntries,
    ...signEntries,
  ];
}
