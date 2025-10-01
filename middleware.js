import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";

export const config = { matcher: "/:path*" };

export default async function middleware(req) {
  const rawHost = req.headers.get("host") || "";
  const host = rawHost.replace(/^www\./i, ""); // bỏ www. nếu có

  const hosts = (await get("hosts")) || {};
  // Ưu tiên đúng host, nếu không có thì dùng __default
  const info = hosts[host] || hosts["__default"];

  if (!info) return new NextResponse("Host config not found", { status: 404 });

  const active = info.active || "A";
  const dest = info.links?.[active];
  if (!dest) return new NextResponse("Active link missing", { status: 500 });

  return NextResponse.redirect(dest, 302);
}
