import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { locales } from "@/i18n/config";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PostHogProvider from "@/components/PostHogProvider";
import PostHogPageView from "@/components/PostHogPageView";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL("https://practice.deafened.org"),
    title: t("siteTitle"),
    description: t("siteDescription"),
    openGraph: {
      type: "website",
      siteName: t("siteTitle"),
      title: t("siteTitle"),
      description: t("siteDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("siteDescription"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <NextIntlClientProvider messages={messages}>
          <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-600 focus:text-white"
          >
            {t("skipToContent")}
          </a>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <nav
                aria-label="Main navigation"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
              >
                <Link
                  href="/"
                  className="text-xl font-bold text-brand-700 dark:text-brand-200 shrink-0"
                >
                  ASL Practice
                </Link>
                <div className="flex items-center gap-3 sm:gap-6">
                  <Link
                    href="/signs"
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600"
                  >
                    {t("signs")}
                  </Link>
                  <Link
                    href="/paths"
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600"
                  >
                    {t("paths")}
                  </Link>
                  <a
                    href="https://deafened.org"
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 hidden sm:inline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("deafenedOrg")}
                  </a>
                  <LanguageSwitcher />
                </div>
              </nav>
            </header>

            <main id="main-content" className="flex-1">
              {children}
            </main>

            <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 space-y-2">
                <p>
                  {t.rich("signDataFrom", {
                    aslLexLink: (chunks) => (
                      <a
                        href="https://asl-lex.org/"
                        className="underline hover:text-brand-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {chunks}
                      </a>
                    ),
                    deafenedLink: (chunks) => (
                      <a
                        href="https://deafened.org"
                        className="underline hover:text-brand-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </p>
                <p>
                  <Link
                    href="/privacy"
                    className="underline hover:text-brand-600"
                  >
                    {t("privacyPolicy")}
                  </Link>
                </p>
              </div>
            </footer>
          </div>
        </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
