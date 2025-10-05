import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";

// Cache tại edge (bộ nhớ tạm), làm mới mỗi 60s
let cache = { data: null, lastFetch: 0 };

// Áp dụng middleware cho tất cả path, trừ API, admin, static assets
export const config = {
  matcher: ["/((?!api|admin|_next/static|_next/image|favicon.ico).*)"]
};

export default async function middleware(req) {
  const now = Date.now();
  const hostHeader = req.headers.get("host") || "";
  const host = hostHeader.toLowerCase().replace(/^www\./, "");

  // Nếu cache quá 60 giây thì fetch mới
  if (!cache.data || now - cache.lastFetch > 60000) {
    try {
      const data = await get("hosts");
      cache.data = data || {};
      cache.lastFetch = now;
      console.log("[EdgeConfig] Refreshed at", new Date().toISOString());
    } catch (err) {
      console.error("[EdgeConfig] Fetch failed:", err);
    }
  }

  const hosts = cache.data || {};
  const info = hosts[host] || hosts["__default"];

  if (!info) {
    return new NextResponse("Host config not found", { status: 404 });
  }

  const active = info.active || "A";
  const dest = info.links?.[active];
  if (!dest) {
    return new NextResponse("Active link missing", { status: 500 });
  }

  // Lọc bot để tránh tính view ảo (tùy chọn)
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isHead = req.method === "HEAD";
  const isBot = /bot|crawler|facebookexternalhit|slackbot|whatsapp|telegram|discord|linkedinbot/.test(ua);

  if (isHead || isBot) {
    return new NextResponse(null, { status: 204 }); // Không redirect bot
  }

  // Giữ nguyên query string (nếu có) + thêm UTM tag cho tracking
  const url = new URL(req.url);
  const hasQuery = url.search.length > 0;
  const destUrl = dest + (hasQuery ? url.search + "&" : "?") + "utm_source=gateway&utm_medium=redirect";

  return NextResponse.redirect(destUrl, 302);
}
