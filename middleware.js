import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";

// BẮT BUỘC: bỏ qua /api/*, /admin, và static assets _next/*
export const config = {
  matcher: ["/((?!api|admin|_next/static|_next/image|favicon.ico).*)"]
};

export default async function middleware(req) {
  const rawHost = req.headers.get("host") || "";
  const host = rawHost.toLowerCase().replace(/^www\./, ""); // bỏ www.

  // Đọc đúng key "hosts" trong Edge Config
  const hosts = (await get("hosts")) || {};
  const info = hosts[host] || hosts["__default"]; // có thể cấu hình mặc định

  if (!info) return new NextResponse("Host config not found", { status: 404 });

  const active = info.active || "A";
  const dest = info.links?.[active];
  if (!dest) return new NextResponse("Active link missing", { status: 500 });

  return NextResponse.redirect(dest, 302);
}
