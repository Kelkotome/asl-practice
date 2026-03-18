import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://practice.deafened.org"),
  title: "ASL Practice — Deafened.org",
  description:
    "Practice American Sign Language with real-time camera feedback and AI coaching powered by ASL-LEX data.",
  openGraph: {
    type: "website",
    siteName: "ASL Practice — Deafened.org",
    title: "ASL Practice — Deafened.org",
    description:
      "Practice American Sign Language with real-time camera feedback and AI coaching powered by ASL-LEX data.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASL Practice — Deafened.org",
    description:
      "Practice American Sign Language with real-time camera feedback and AI coaching powered by ASL-LEX data.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-600 focus:text-white"
        >
          Skip to content
        </a>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                  Signs
                </Link>
                <Link
                  href="/paths"
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600"
                >
                  Paths
                </Link>
                <a
                  href="https://deafened.org"
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 hidden sm:inline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Deafened.org
                </a>
              </div>
            </nav>
          </header>

          <main id="main-content" className="flex-1">{children}</main>

          <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 space-y-2">
              <p>
                Sign data from{" "}
                <a
                  href="https://asl-lex.org/"
                  className="underline hover:text-brand-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ASL-LEX 2.0
                </a>{" "}
                (Caselli et al., 2017). Built by{" "}
                <a
                  href="https://deafened.org"
                  className="underline hover:text-brand-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Deafened.org
                </a>
                .
              </p>
              <p>
                <Link
                  href="/privacy"
                  className="underline hover:text-brand-600"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
