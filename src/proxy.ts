import { NextResponse, type NextRequest } from "next/server";

/*
 * Optimistic auth gate: only checks that a session cookie exists, so signed-out
 * users never see an app shell flash. The API verifies the token on every
 * request; a revoked/expired cookie gets a 401 and the client sends the user
 * back to /login.
 */
const SESSION_COOKIES = ["__Host-dt_session", "dt_session"];
const PUBLIC_PATHS = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  if (hasSession && (isPublic || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip API calls, Next internals and static files.
  matcher: ["/((?!api/|_next/|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt)$).*)"],
};
