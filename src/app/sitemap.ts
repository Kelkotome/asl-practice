import type { MetadataRoute } from "next";
import * as fs from "fs";
import * as path from "path";
import type { SignCatalogEntry } from "@/lib/signs/types";
import { LEARNING_PATHS } from "@/lib/paths/data";
import { locales, defaultLocale } from "@/i18n/config";

function localeUrl(locale: string, pagePath: string): string {
  return `https://practice.deafened.org${locale === defaultLocale ? "" : `/${locale}`}${pagePath}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const filePath = path.join(process.cwd(), "data", "signs.json");
  const catalog: SignCatalogEntry[] = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );

  const signPaths = catalog.map((sign) => `/signs/${sign.slug}`);
  const pathPaths = LEARNING_PATHS.map((p) => `/paths/${p.slug}`);
  const staticPaths = ["", "/signs", "/paths", "/privacy"];

  const allPaths = [...staticPaths, ...pathPaths, ...signPaths];

  return allPaths.flatMap((pagePath) =>
    locales.map((locale) => ({
      url: localeUrl(locale, pagePath),
      changeFrequency: pagePath === "" || pagePath === "/signs" || pagePath === "/paths"
        ? ("weekly" as const)
        : ("monthly" as const),
      priority: locale === defaultLocale
        ? (pagePath === "" ? 1 : pagePath === "/signs" || pagePath === "/paths" ? 0.9 : 0.7)
        : (pagePath === "" ? 0.8 : 0.5),
    }))
  );
}
