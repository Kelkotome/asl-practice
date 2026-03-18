import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import redirects from "../data/redirects.json";

// Build a lookup map for O(1) redirect matching
const redirectMap = new Map<string, string>();
for (const { source, destination } of redirects) {
  redirectMap.set(`/signs/${source}`, `/signs/${destination}`);
}

export function middleware(request: NextRequest) {
  const dest = redirectMap.get(request.nextUrl.pathname);
  if (dest) {
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url, 301);
  }
}

export const config = {
  matcher: "/signs/:path*",
};
