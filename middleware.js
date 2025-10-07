import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

let cache = { data: null, lastFetch: 0 };
const TTL = 60000; // 1 phút (bạn có thể tăng lên 300000 = 5 phút)

export const config = {
  matcher: ["/((?!api|admin|_next/static|_next/image|favicon.ico).*)"]
};

export default async function middleware(req) {
  const now = Date.now();
  const hostHeader = req.headers.get("host") || "";
  const host = hostHeader.toLowerCase().replace(/^www\./, "");

  // chỉ gọi KV nếu cache hết hạn
  if (!cache.data || now - cache.lastFetch > TTL) {
    try {
      const raw = await kv.get("hosts");
      cache.data = JSON.parse(raw || "{}");
      cache.lastFetch = now;
      console.log("[KV] Refreshed:", new Date().toISOString());
    } catch (e) {
      console.error("[KV] Fetch failed", e);
    }
  }

  const hosts = cache.data || {};
  const info = hosts[host] || hosts["__default"];
  if (!info) return new NextResponse("Host config not found", { status: 404 });

  const active = info.active || "A";
  const dest = info.links?.[active];
  if (!dest) return new NextResponse("Active link missing", { status: 500 });

  // bỏ qua bot để không đếm view ảo
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isHead = req.method === "HEAD";
  const isBot = /bot|crawler|facebookexternalhit|slackbot|whatsapp|telegram|discord|linkedinbot/.test(ua);
  if (isHead || isBot) return new NextResponse(null, { status: 204 });

  // giữ query + thêm UTM tracking
  const url = new URL(req.url);
  const hasQuery = url.search.length > 0;
  const destUrl =
    dest +
    (hasQuery ? url.search + "&" : "?") +
    "utm_source=gateway&utm_medium=redirect";

  // log click thật (fire and forget)
  fetch(`${req.nextUrl.origin}/api/log-click?host=${encodeURIComponent(host)}`).catch(() => {});

  return NextResponse.redirect(destUrl, 302);
}
