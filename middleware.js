// middleware.js — redirect thông minh giữa 2 store Shopify

const PRIMARY = "https://yanthypa.com/";   // Shopify chính
const FALLBACK = "https://buthihan.com/";  // Shopify dự phòng
const OK = new Set([200, 301, 302, 307, 308]);

export const config = { matcher: "/:path*" };

async function healthy(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 1200); // timeout 1.2s
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual", signal: controller.signal });
    return OK.has(res.status);
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export default async function middleware(req) {
  const { pathname, search } = new URL(req.url);
  const buildUrl = (base) =>
    search ? `${base}${pathname}${base.includes("?") ? "&" : "?"}${search.slice(1)}` : `${base}${pathname}`;

  const urlA = buildUrl(PRIMARY);
  if (await healthy(urlA)) {
    return Response.redirect(urlA, 302);
  }
  const urlB = buildUrl(FALLBACK);
  return Response.redirect(urlB, 302);
}
