import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import redirects from "../data/redirects.json";

// Build a lookup map keyed by slug only (not full path)
const redirectMap = new Map<string, string>();
for (const { source, destination } of redirects) {
  redirectMap.set(source, destination);
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Strip locale prefix to check redirects: /es/signs/old-slug → /signs/old-slug
  const localeMatch = pathname.match(/^\/(es|fr|zh|ko|ja)(\/.*)/);
  const pathWithoutLocale = localeMatch ? localeMatch[2] : pathname;
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";

  // Check sign redirects
  const slugMatch = pathWithoutLocale.match(/^\/signs\/(.+)/);
  if (slugMatch) {
    const dest = redirectMap.get(slugMatch[1]);
    if (dest) {
      const url = request.nextUrl.clone();
      url.pathname = `${localePrefix}/signs/${dest}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // Then run next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|_next|.*\\..*).*)",
};
