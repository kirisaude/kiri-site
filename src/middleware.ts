import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin tem autenticação própria — não passa pelo acesso geral
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/acesso") ||
    pathname.startsWith("/api/acesso") ||
    pathname.startsWith("/api/inscricao") ||
    pathname.startsWith("/api/share-card") ||
    pathname.startsWith("/compartilhar") ||
    pathname.startsWith("/card") ||
    pathname.startsWith("/profissional") ||
    pathname.startsWith("/profissionais") ||
    pathname.startsWith("/politica-de-privacidade") ||
    pathname.startsWith("/termos") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/opengraph") ||
    pathname.startsWith("/kiri-og") ||
    pathname.startsWith("/kiri-icon") ||
    /\.(png|jpg|jpeg|svg|ico|webp|ttf|woff|woff2)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const auth = request.cookies.get("kiri_acesso");
  if (auth?.value !== "ok") {
    return NextResponse.redirect(new URL("/acesso", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
