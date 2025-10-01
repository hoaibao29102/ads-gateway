import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";

// Chỉ áp dụng middleware cho mọi route TRỪ /api/* và /admin
export const config = {
  matcher: [
    "/((?!api|admin).*)"
  ]
};

export default async function middleware(req) {
  const rawHost = req.headers.get("host") || "";
  const host = rawHost.toLowerCase().replace(/^www\./, "");

  const all = (await get("hosts")) || {};
  const info = all[host] || all["__default"];

  if (!info) return new NextResponse("Host config not found", { status: 404 });

  const active = info.active || "A";
  const dest = info.links?.[active];
  if (!dest) return new NextResponse("Active link missing", { status: 500 });

  return NextResponse.redirect(dest, 302);
}
