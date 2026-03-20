import * as fs from "fs";
import * as path from "path";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { SignDetail, SignCatalogEntry } from "@/lib/signs/types";
import { getRelatedSigns } from "@/lib/signs/related";
import { locales, defaultLocale } from "@/i18n/config";
import PracticeClient from "./PracticeClient";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
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
  const { locale, slug } = await params;
  const sign = loadSignDetail(slug);
  const t = await getTranslations({ locale, namespace: "metadata" });

  if (!sign) return { title: t("signNotFound") };

  const details = `${sign.signType || ""} sign${sign.majorLocation ? `, location: ${sign.majorLocation}` : ""}`;
  const title = t("practiceTitle", { name: sign.name });
  const description = t("practiceDescription", { name: sign.name, details });
  const basePath = `/signs/${sign.slug}`;

  return {
    title,
    description,
    openGraph: {
      url: `https://practice.deafened.org${basePath}`,
      title,
      description,
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

export default async function PracticePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  const sign = loadSignDetail(slug);

  if (!sign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("signNotFound")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The sign &quot;{slug}&quot; was not found.
        </p>
      </div>
    );
  }

  const catalog = loadCatalog();
  const relatedSigns = getRelatedSigns(sign, catalog, 6);

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to sign "${sign.name}" in ASL`,
    description: `Learn the ASL sign for "${sign.name}" with video reference and AI coaching.`,
    step: [
      {
        "@type": "HowToStep",
        name: "Watch the reference video",
        text: `Watch the reference video for the sign "${sign.name}" to see the correct handshape, movement, and location.`,
      },
      {
        "@type": "HowToStep",
        name: "Practice with your camera",
        text: "Turn on your camera and attempt the sign. MediaPipe will track your hand landmarks in real time.",
      },
      {
        "@type": "HowToStep",
        name: "Get AI coaching feedback",
        text: "Receive personalized feedback comparing your attempt against ASL-LEX phonological data.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Suspense>
        <PracticeClient sign={sign} relatedSigns={relatedSigns} />
      </Suspense>
    </>
  );
}
