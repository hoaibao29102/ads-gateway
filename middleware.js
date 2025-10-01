import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";

export const config = { matcher: "/:path*" };

export default async function middleware(req) {
  const host = req.headers.get("host");       // ví dụ: ad1.com
  if (!host) return new NextResponse("Missing Host", { status: 400 });

  // Lấy đúng key "hosts" trong Edge Config (KHÔNG dùng get() trống)
  const hosts = (await get("hosts")) || {};
  const info = hosts[host];

  if (!info) return new NextResponse("Host config not found", { status: 404 });

  const activeKey = info.active || "A";
  const dest = info.links?.[activeKey];
  if (!dest) return new NextResponse("Active link missing", { status: 500 });

  return NextResponse.redirect(dest, 302);
}
