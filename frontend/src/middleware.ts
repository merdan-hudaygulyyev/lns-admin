import createNextIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { isLocale, routing } from "./i18n/routing";

const intlMiddleware = createNextIntlMiddleware(routing);
const TOKEN_COOKIE = "admin_token";

function splitPath(pathname: string): { locale: string; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) {
    return { locale: segments[0], path: `/${segments.slice(1).join("/")}` };
  }
  return { locale: routing.defaultLocale, path: pathname || "/" };
}

function localizedPath(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

export function middleware(request: NextRequest) {
  const { locale, path } = splitPath(request.nextUrl.pathname);
  const hasToken = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const isLoginPage = path === "/login";

  if (!hasToken && !isLoginPage) {
    return NextResponse.redirect(new URL(localizedPath(locale, "/login"), request.url));
  }

  if (hasToken && isLoginPage) {
    return NextResponse.redirect(new URL(localizedPath(locale, "/members"), request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(tk|ru|tm|uz)/:path*", "/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)"],
};
