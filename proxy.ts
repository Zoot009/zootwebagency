import { NextResponse, type NextRequest } from "next/server";

// Spam URLs Google found from the old (hacked) WordPress host, e.g. /?o=123, /?e=123,
// /?productSearch/..., /?shop/sold?id=..., /?product/review/..., /product/category/...
// 410 Gone tells Google to drop them; serving the homepage (200) would keep them indexed.
// nextUrl.search may encode "/" as %2F, so match both.
const SPAM_QUERY = /^\?(?:[oet]=\d|productSearch|(?:product|shop)(?:\/|%2F))/i;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/product/") || SPAM_QUERY.test(search)) {
    return new NextResponse("Gone", { status: 410, headers: { "X-Robots-Tag": "noindex" } });
  }
}

export const config = {
  matcher: ["/", "/product/:path*"],
};
